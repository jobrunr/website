---
title: "Easily process long-running jobs with JobRunr"
summary: "A tutorial on how to use JobRunr, Spring Data JPA and Docx-Stamper to generate the salary slips for all employees of Acme Corp"
feature_image: /blog/2020-04-23-jobrunr-gets-jobs-done.webp
aspect_ratio: 1;
date: 2020-04-23T11:12:23+02:00
author: "Ronald Dehuysser"
tags:
  - blog
  - tutorial
---
In this tutorial, we will be working for the fictional company Acme Corp and we need to generate the salary slips for all of Acme Corp's employees.

> TLDR; you can find the complete project on our Github repository: https://github.com/jobrunr/example-salary-slip


To do so, we will be using 3 open-source components:
- [JobRunr](https://github.com/jobrunr/jobrunr): JobRunr allows to easily schedule and process background jobs using Java 8 lambdas. It is backed by persistent storage and can process jobs in a parallel and distributed manner. Thanks to the built-in dashboard we have an in-depth overview into all our background jobs.
- [Spring Data Jpa](https://docs.spring.io/spring-data/): If you want to easily access data in a relational database, Spring Data Jpa is here to help. You can create repositories using nothing more than a simple interface
- [Docx-Stamper](https://github.com/thombergs/docx-stamper): Docx-Stamper allows to easily generate Word (.docx) documents backed by templates
Architecture

During this tutorial, we will generate the weekly salary slip of all of Acme Corp's employees and email it to them. How? Well, by
- creating a recurring job using JobRunr that will run every week - it will get all of Acme Corp's employees using Spring Data Jpa and for each of these employees schedule a new background job to create the salary slip
- each of these background jobs will fetch the Employee and
  - consume a `TimeClockService` which gives the amount of hours an employee worked for the given week.
  - generate a salary slip document using a `DocumentGenerationService` which will contain the name of the employee and the amount of hour he or she worked. The salary slip document is generated from a Word template and converted to a PDF file.
  - send an email to the employee with his salary slip using an `EmailService`.

<figure>
{{< img src="/blog/2020-04-23-tutorial-report.webp" class="kg-image">}}
<figcaption>We will transform a Word template to PDF and replace all placeholders with actual values.</figcaption>
</figure>


#### Let's gets started!
In this tutorial we omit all Java imports for brevity - to find them, just visit the example project on https://github.com/jobrunr/example-salary-slip

For building this salary slip service, we use gradle and our `build.gradle` file is as follows:

##### Gradle build file
<figure style="width: 100%; max-width: 100%">

```java
plugins {
    id 'java'
    id 'idea'
    id 'org.springframework.boot' version '2.2.2.RELEASE'
    id 'io.spring.dependency-management' version '1.0.8.RELEASE'
}

group 'org.paycheck'
version '1.0-SNAPSHOT'

repositories {
    mavenCentral()
    jcenter()
    mavenLocal()
}

configurations.all {
    exclude group: 'org.slf4j', module: 'slf4j-log4j12'
}

dependencies {
    implementation 'org.jobrunr:jobrunr:0.9.2'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-mail'
    implementation 'com.fasterxml.jackson.core:jackson-databind'
    implementation 'com.fasterxml.jackson.datatype:jackson-datatype-jsr310'
    implementation 'org.wickedsource.docx-stamper:docx-stamper:1.4.0'
    implementation 'org.docx4j:docx4j-core:8.1.6'
    implementation 'org.docx4j:docx4j-JAXB-ReferenceImpl:11.1.3'

    implementation 'com.github.javafaker:javafaker:1.0.2'
    implementation 'com.h2database:h2'

    testImplementation 'org.junit.jupiter:junit-jupiter:5.6.1'
    testImplementation 'org.awaitility:awaitility:4.0.2'
}

test {
    useJUnitPlatform()
}
```
<figcaption>our build.gradle file uses JobRunr, Spring Boot Data, Sprint Boot Mail and Docx-Stamper. We exclude slf4j-log4j12 as it clashes with Logback provided by Spring</figcaption>
</figure>

##### Employee
Since we need to create salary slips for all employees let us start with the `Employee` class - it is a simple Entity with some fields like `firstName`, `lastName` and `email`.

<figure style="width: 100%; max-width: 100%">

```java
package org.jobrunr.example.employee;

@Entity
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String firstName;
    private String lastName;
    private String email;

    protected Employee() {
    }

    public Employee(String firstName, String lastName, String email) {
        this(null, firstName, lastName, email);
    }

    public Employee(Long id, String firstName, String lastName, String email) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }

    @Override
    public String toString() {
        return String.format(
                "Employee[id=%d, firstName='%s', lastName='%s']",
                id, firstName, lastName);
    }

    public Long getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }
}
```
<figcaption>Our Employee is a simple javax persistence entity</figcaption>
</figure>

##### EmployeeRepository
<figure style="width: 100%; max-width: 100%">

```java
package org.jobrunr.example.employee;

public interface EmployeeRepository extends CrudRepository<Employee, Long> {

    @Query("select e.id from Employee e")
    Stream<Long> getAllEmployeeIds();

}
```
<figcaption>the EmployeeRepository extends the Spring Data CrudRepository and adds an extra method to fetch all the id's of the Employees</figcaption>
</figure>

##### WorkWeek
Since the salary slip is generated once per week, we need a class representing the amount of time an employee has worked that week - the `WorkWeek` class. It has some extra fields like the `weekNbr` and a from and to date which we will use for our generated salary slip document.

<figure style="width: 100%; max-width: 100%">

```java
package org.jobrunr.example.timeclock;

public class WorkWeek {

    private final int weekNbr;
    private final BigDecimal workHoursMonday;
    private final BigDecimal workHoursTuesday;
    private final BigDecimal workHoursWednesday;
    private final BigDecimal workHoursThursday;
    private final BigDecimal workHoursFriday;
    private final LocalDate from;
    private final LocalDate to;

    public WorkWeek(BigDecimal workHoursMonday, BigDecimal workHoursTuesday, BigDecimal workHoursWednesday, BigDecimal workHoursThursday, BigDecimal workHoursFriday) {
        this.workHoursMonday = workHoursMonday;
        this.workHoursTuesday = workHoursTuesday;
        this.workHoursWednesday = workHoursWednesday;
        this.workHoursThursday = workHoursThursday;
        this.workHoursFriday = workHoursFriday;
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        weekNbr = now().get(weekFields.weekOfWeekBasedYear());
        this.from = now().with(TemporalAdjusters.previous(DayOfWeek.MONDAY));
        this.to = now().with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
    }

    public BigDecimal getWorkHoursMonday() {
        return workHoursMonday;
    }

    public BigDecimal getWorkHoursTuesday() {
        return workHoursTuesday;
    }

    public BigDecimal getWorkHoursWednesday() {
        return workHoursWednesday;
    }

    public BigDecimal getWorkHoursThursday() {
        return workHoursThursday;
    }

    public BigDecimal getWorkHoursFriday() {
        return workHoursFriday;
    }

    public int getWeekNbr() {
        return weekNbr;
    }

    public LocalDate getFrom() {
        return from;
    }

    public LocalDate getTo() {
        return to;
    }

    public BigDecimal getTotal() {
        return workHoursMonday
                .add(workHoursTuesday)
                .add(workHoursWednesday)
                .add(workHoursThursday)
                .add(workHoursFriday);
    }
}
```
</figure>

##### TimeClockService
To get a WorkWeek class for a certain employee, we create a `TimeClockService` which is a Spring Component. As we don't want to make this tutorial overly complex, here we use a stub which generates some random data. In a real-world application this service would make a REST or SOAP request to another microservice.

<figure style="width: 100%; max-width: 100%">

```java
package org.jobrunr.example.timeclock;

@Component
public class TimeClockService {

    public WorkWeek getWorkWeekForEmployee(Long employeeId) {
        try {
            //simulate a long-during call
            Thread.sleep(ThreadLocalRandom.current().nextInt(3, 5 + 1) * 1000);
            return new WorkWeek(
                    BigDecimal.valueOf(getRandomHours()),
                    BigDecimal.valueOf(getRandomHours()),
                    BigDecimal.valueOf(getRandomHours()),
                    BigDecimal.valueOf(getRandomHours()),
                    BigDecimal.valueOf(getRandomHours())
            );
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
        }
    }

    private int getRandomHours() {
        Random r = new Random();
        return r.nextInt((8 - 5) + 1) + 5;
    }

}
```
<figcaption>to simplify this tutorial, we use a stub for the TimeClockService which generates Random work hours for each employee</figcaption>
</figure>

We now have all the necessary data to generate our salary slip - except the SalarySlip class itself:

##### SalarySlip
<figure style="width: 100%; max-width: 100%">

```java
package org.jobrunr.example.paycheck;

public class SalarySlip {

    private final Employee employee;
    private final WorkWeek workWeek;

    public SalarySlip(Employee employee, WorkWeek workWeek) {
        this.employee = employee;
        this.workWeek = workWeek;
    }

    public Employee getEmployee() {
        return employee;
    }

    public WorkWeek getWorkWeek() {
        return workWeek;
    }

    public BigDecimal getTotal() {
        BigDecimal totalPerHour = getTotalPerHour();
        BigDecimal amountOfWorkedHours = getAmountOfWorkedHours();
        return totalPerHour.multiply(amountOfWorkedHours).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal getAmountOfWorkedHours() {
        return workWeek.getTotal();
    }

    private BigDecimal getTotalPerHour() {
        return BigDecimal.valueOf(21.50);
    }
}
```
<figcaption>the SalarySlip class contains all the data necessary to generate a salary slip and will be used by the DocumentGenerationService to generate the salary slips as PDF documents.</figcaption>
</figure>


##### DocumentGenerationService
<figure style="width: 100%; max-width: 100%">

```java
package org.jobrunr.example.paycheck;

@Component
public class DocumentGenerationService {

    public void generateDocument(Path wordTemplatePath, Path wordOutputPath, Object context) throws IOException, Docx4JException {
        Files.createDirectories(wordOutputPath.getParent().toAbsolutePath());

        try(InputStream template = Files.newInputStream(wordTemplatePath); OutputStream out = Files.newOutputStream(wordOutputPath)) {
            final ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            final DocxStamper stamper = new DocxStamperConfiguration().setFailOnUnresolvedExpression(true).build();
            stamper.stamp(template, context, byteArrayOutputStream);

            Docx4J.toPDF(WordprocessingMLPackage.load(new ByteArrayInputStream(byteArrayOutputStream.toByteArray())), out);
        }

    }

}
```
</figure>

The `DocumentGenerationService` is also a Spring Component and has the responsibility to generate the actual salary slip documents based on a word template. The word template has a lot of placeholders, like `${employee.firstName}`, `${employee.lastName}` and `${workWeek.workHoursMonday.setScale(2)}` that will be replaced by DocxStamper using the given context object - in our case a `SalarySlip` object. Finally, the Word document with all fields filled in is converted to a PDF document.

##### EmailService
The `EmailService` is again a Spring Component and has the responsibility to email the final salary slip word document to the employee - it uses Spring Boot Starter Email and using a `MimeMessage` created by the `JavaMailSender`. It has a method called `sendSalarySlip` with two arguments - the employee class and the path to the salary slip for that employee. Using these argument, we can send both a personalized text email and attach the actual salary slip as an attachment.

The `JavaMailSender` is a class provided by Spring Boot Starter Mail and configured using a properties file. You can find the properties file here: ...

<figure style="width: 100%; max-width: 100%">

```java
package org.jobrunr.example.email;

@Component
public class EmailService {

    public JavaMailSender emailSender;

    public EmailService(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    public void sendSalarySlip(Employee employee, Path salarySlipPath) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(employee.getEmail());
        helper.setSubject("Your weekly salary slip");
        helper.setText(String.format("Dear %s,\n\nhere you can find your weekly salary slip. \n \nThanks again for your hard work,\nAcme corp", employee.getFirstName()));

        FileSystemResource file = new FileSystemResource(salarySlipPath);
        helper.addAttachment("Salary Slip", file);
        emailSender.send(message);
    }

}
```
</figure>


##### And finally, the SalarySlipService
The `SalarySlipService` is the last step of the puzzle and wires everything together:

- it has the path to the salary slip word template
- it uses the other components we already created:
- the `EmployeeRepository` to get all employees from the database
- the `TimeClockService` to get the amount of hours an employee worked
- the `DocumentGenerationService` to create a salary slip from the given Word template
- the `EmailService` to send a personalized email with the salary slip as attachment to the employee

It also two important public methods:

__generateAndSendSalarySlip__

The method `generateAndSendSalarySlip` uses the employee id to get the actual employee data, generates the salary slip Word document and sends it via email to the employee. It will be a JobRunr background job and it is called from the method `generateAndSendSalarySlipToAllEmployees`. We annotate it with the Job annotation to have meaningful names in dashboard of JobRunr.

<figure style="width: 100%; max-width: 100%">

```java
    @Job(name = "Generate and send salary slip to employee %0")
    public void generateAndSendSalarySlip(Long employeeId) throws Exception {
        final Employee employee = getEmployee(employeeId);
        Path salarySlipPath = generateSalarySlip(employee);
        emailService.sendSalarySlip(employee, salarySlipPath);
    }
```
<figcaption>The method generateAndSendSalarySlip, a standard method in our service, will become a background job</figcaption>
</figure>

__generateAndSendSalarySlipToAllEmployees__

This is our main method that will be scheduled each week - it gets a stream of employee ids and using the `BackgroundJob.enqueue` method, we create a background job of the `generateAndSendSalarySlip` method.

The document generation fails because there is not enough disk space? Or the `TimeClockService` fails for an employee because the external microservice is down? No worries - as JobRunr is fault-tolerant (it will automatically retry failed jobs with an exponential back-off policy), these failing jobs will be retried 10 times automatically.

<figure style="width: 100%; max-width: 100%">

```java
    @Transactional(readOnly = true)
    @Job(name = "Generate and send salary slip to all employees")
    public void generateAndSendSalarySlipToAllEmployees() {
        final Stream<Long> allEmployees = employeeRepository.getAllEmployeeIds();
        BackgroundJob.<SalarySlipService, Long>enqueue(allEmployees, (salarySlipService, employeeId) -> salarySlipService.generateAndSendSalarySlip(employeeId));
    }
```
<figcaption>This method will be scheduled each week and will create new background jobs for the generation and sending of the salary slip for each employee.</figcaption>
</figure>

The complete SalarySlipService is as follows:

<figure style="width: 100%; max-width: 100%">

```java
package org.jobrunr.example.paycheck;

@Component
public class SalarySlipService {

    private static final Path salarySlipTemplatePath = Path.of("src/main/resources/templates/salary-slip-template.docx");

    private final EmployeeRepository employeeRepository;
    private final TimeClockService timeClockService;
    private final DocumentGenerationService documentGenerationService;
    private final EmailService emailService;

    public SalarySlipService(EmployeeRepository employeeRepository, TimeClockService timeClockService, DocumentGenerationService documentGenerationService, EmailService emailService) {
        this.employeeRepository = employeeRepository;
        this.timeClockService = timeClockService;
        this.documentGenerationService = documentGenerationService;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    @Job(name = "Generate and send salary slip to all employees")
    public void generateAndSendSalarySlipToAllEmployees() {
        final Stream<Long> allEmployees = employeeRepository.getAllEmployeeIds();
        BackgroundJob.<SalarySlipService, Long>enqueue(allEmployees, (salarySlipService, employeeId) -> salarySlipService.generateAndSendSalarySlip(employeeId));
    }

    @Job(name = "Generate and send salary slip to employee %0")
    public void generateAndSendSalarySlip(Long employeeId) throws Exception {
        final Employee employee = getEmployee(employeeId);
        Path salarySlipPath = generateSalarySlip(employee);
        emailService.sendSalarySlip(employee, salarySlipPath);
    }

    private Path generateSalarySlip(Employee employee) throws Exception {
        final WorkWeek workWeek = getWorkWeekForEmployee(employee.getId());
        final SalarySlip salarySlip = new SalarySlip(employee, workWeek);
        return generateSalarySlipDocumentUsingTemplate(salarySlip);
    }

    private Path generateSalarySlipDocumentUsingTemplate(SalarySlip salarySlip) throws Exception {
        Path salarySlipPath = Paths.get(System.getProperty("java.io.tmpdir"), String.valueOf(now().getYear()), format("workweek-%d", salarySlip.getWorkWeek().getWeekNbr()), format("salary-slip-employee-%d.docx", salarySlip.getEmployee().getId()));
        documentGenerationService.generateDocument(salarySlipTemplatePath, salarySlipPath, salarySlip);
        return salarySlipPath;
    }

    private WorkWeek getWorkWeekForEmployee(Long employeeId) {
        return timeClockService.getWorkWeekForEmployee(employeeId);
    }

    private Employee getEmployee(Long employeeId) {
        return employeeRepository.findById(employeeId).orElseThrow(() -> new IllegalArgumentException(format("Employee with id '%d' does not exist", employeeId)));
    }
}
```
</figure>

##### Last but not least - our Spring Boot Application
The Spring Boot Application bootstraps our application and has one important piece of code:

<figure style="width: 100%; max-width: 100%">

```java
BackgroundJob.scheduleRecurringly(
	"generate-and-send-salary-slip",
	SalarySlipService::generateAndSendSalarySlipToAllEmployees,
	Cron.weekly(DayOfWeek.SUNDAY, 22)
);
```
<figcaption>This method call ensures that the generateAndSendSalarySlipToAllEmployees method of our SalarySlipService will be triggered each Sunday at 10pm.</figcaption>
</figure>

In this SpringBootApplication we create some fake employees, define a DataSource (in our case a simple H2 database) and initialize JobRunr using its fluent-api.

<figure style="width: 100%; max-width: 100%">

```java
package org.jobrunr.example;

@SpringBootApplication
public class SalarySlipMicroService {

    public static void main(String[] args) {
        SpringApplication.run(SalarySlipMicroService.class, args);
    }

    @Bean
    public CommandLineRunner demo(EmployeeRepository repository) {
        final Faker faker = new Faker();
        return (args) -> {
            for(int i = 0; i < 1000; i++) {
                repository.save(new Employee(faker.name().firstName(), faker.name().lastName(), faker.internet().emailAddress()));
            }

            BackgroundJob.scheduleRecurringly(
                    "generate-and-send-salary-slip",
                    SalarySlipService::generateAndSendSalarySlipToAllEmployees,
                    Cron.weekly(DayOfWeek.SUNDAY, 22)
            );

            Thread.currentThread().join();
        };
    }

    @Bean
    public DataSource dataSource() {
        final JdbcDataSource ds = new JdbcDataSource();
        ds.setURL("jdbc:h2:" + Paths.get(System.getProperty("java.io.tmpdir"), "paycheck"));
        ds.setUser("sa");
        ds.setPassword("sa");
        return ds;
    }

    @Bean
    public JobScheduler initJobRunr(ApplicationContext applicationContext) {
        return JobRunr.configure()
                .useStorageProvider(SqlStorageProviderFactory
                        .using(applicationContext.getBean(DataSource.class)))
                .useJobActivator(applicationContext::getBean)
                .useDefaultBackgroundJobServer()
                .useDashboard()
                .initialize();
    }

}
```
</figure>
Time to use our new application!

Once you start the SalarySlipMicroService application, you can open your browser using the url http://localhost:8000 and navigate to the Recurring jobs tab.

<figure>
{{< img src="/blog/2020-04-23-tutorial-salary-slip-01-recurring-job.webp" class="kg-image" >}}
<figcaption>Our recurring job that will be triggered each Sunday.</figcaption>
</figure>


To test it, we trigger it now manually. The job is processed and schedules a new job to create the salary slip for each employee. Within 15 seconds the processing of these jobs start and we will see the generated PDF documents in our tmp folder.

<figure>
{{< img src="/blog/2020-04-23-tutorial-salary-slip-02.webp" class="kg-image" >}}
<figcaption>An overview of enqueued jobs</figcaption>
</figure>

We can inspect a Job and see them succeed - if it would fail for some reason, they will be automatically retried.

<figure>
{{< img src="/blog/2020-04-23-tutorial-salary-slip-04.webp" class="kg-image" >}}
<figcaption>An overview of a succeeded job</figcaption>
</figure>


### Conclusion:
- JobRunr and Spring Data integrate very well and both are very easy to use. Being able to schedule Java 8 lambdas and have them run in a background process is a really nice feature of JobRunr.
- To convert the Word document to PDF, there is some nasty stuff in the word template (like white text) to have an OK-layout. Docx-Stamper is a great library and depends on Docx4J. Docx4J allows to convert Word documents to PDF but it still requires some work as a couple of hacks were done to get the layout right.