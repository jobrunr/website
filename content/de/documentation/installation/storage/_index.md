---
title: "Speicherung der Jobs"
subtitle: "JobRunr unterstützt sowohl SQL- als auch NoSQL-Datenbanken"
date: 2020-04-30T11:12:23+02:00
layout: "documentation"
menu: 
  main: 
    identifier: storage
    parent: 'installation'
    weight: 5
---
JobRunr speichert die Jobdetails für jeden Job mithilfe eines StorageProviders und unterstützt alle wichtigen SQL-Datenbanken und NoSQL-Datenbanken.

> __Wichtig__: Sie müssen für jede der folgenden Datenbanken die richtige Abhängigkeit (jdbc-Treiber) hinzufügen.

## SQL-Datenbanken
Standardmäßig erstellt JobRunr automatisch die erforderlichen Tabellen für Ihre Datenbank. Wenn Sie jedoch die JobRunr DataSource-DDL-Rechte nicht erteilen möchten, können Sie die Tabellen, die JobRunr selbst verwendet, auf einfache Weise mit einer der folgenden Methoden erstellen:

#### Führen Sie den DatabaseCreator aus
Mit der DatabaseCreator-Klasse können Sie die erforderlichen Tabellen mithilfe eines Terminals erstellen. Sie müssen einen Benutzer mit DDL-Rechten angeben.

```
java -cp jobrunr-${jobrunr.version}.jar org.jobrunr.storage.sql.common.DatabaseCreator {jdbcUrl} {userName} {password}
```

Wenn der Befehl erfolgreich ist, wird eine Bestätigungsmeldung angezeigt.

#### Wenden Sie die SQL-Skripte selbst an
- __Oracle__ - Wenden Sie alle [hier](https://github.com/jobrunr/jobrunr/tree/master/core/src/main/resources/org/jobrunr/storage/sql/oracle/migrations) gefundenen SQL-Skripte an.
- __Postgres__ - Wenden Sie alle [hier](https://github.com/jobrunr/jobrunr/tree/master/core/src/main/resources/org/jobrunr/storage/sql/common/migrations) gefundenen SQL-Skripte an.
- __MySql__ - Wenden Sie alle [hier](https://github.com/jobrunr/jobrunr/tree/master/core/src/main/resources/org/jobrunr/storage/sql/common/migrations) gefundenen SQL-Skripte  überschreibend an Einige dieser SQL-Skripte mit den MySQL-spezifischen Skripten die [hier](https://github.com/jobrunr/jobrunr/tree/master/core/src/main/resources/org/jobrunr/storage/sql/mariadb/migrations) wurden gefunden.
- __MariaDB__ - Wenden Sie alle [hier](https://github.com/jobrunr/jobrunr/tree/master/core/src/main/resources/org/jobrunr/storage/sql/common/migrations) gefundenen SQL-Skripte überschreibend an Einige dieser SQL-Skripte mit den MariaDB-spezifischen Skripten die [hier](https://github.com/jobrunr/jobrunr/tree/master/core/src/main/resources/org/jobrunr/storage/sql/mariadb/migrations) wurden gefunden.
- __DB2__ - Wenden Sie alle [hier](https://github.com/jobrunr/jobrunr/tree/master/core/src/main/resources/org/jobrunr/storage/sql/db2/migrations) gefundenen SQL-Skripte an.

Nachdem Sie die Tabellen erstellt haben, müssen Sie JobRunr wie folgt konfigurieren:

```java
JobRunr.configure()
    .useStorageProvider(new DefaultSqlStorageProvider(dataSource, DatabaseOptions.SKIP_CREATE))
    .useDefaultBackgroundJobServer()
    .initialize();
```


## NoSQL-Datenbanken
- __ElasticSearch__ - JobRunr erstellt die erforderlichen Indizes, um alle Jobs und wiederkehrenden Jobs automatisch für Sie zu speichern. Ihnen wird "jobrunr_" vorangestellt
- __Mongo__ - JobRunr erstellt eine Datenbank mit dem Namen "jobrunr" und die gesamte erforderliche Collection, um alle Jobs und wiederkehrenden Jobs automatisch für Sie zu speichern
- __Redis__ - JobRunr erstellt automatisch alle erforderlichen Datentypen (Strings, Sets, Hashes, ...) für Sie. Sie können aus zwei Implementierungen auswählen:
  - entweder der `JedisRedisStorageProvider`, der Jedis verwendet.
  - und der `LettuceRedisStorageProvider`, der Lettuce verwendet. Wenn Sie diesen `StorageProvider` verwenden, müssen Sie auch` org.apache.commons: commons-dbcp2` eine Abhängigkeit hinzufügen, da der Lettuce-Treiber bei Verwendung von Redis-Transaktionen nicht threadsicher ist.
- __InMemory__ - JobRunr wird mit einem InMemoryStorageProvider geliefert, der sich ideal für einfache Aufgaben eignet, die serverinstanzspezifisch sind und bei denen die Persistenz nicht wichtig ist. Beachten Sie, dass Sie bei Verwendung des `InMemoryStorageProvider` nicht horizontal skalieren können, da der Speicher nicht gemeinsam genutzt wird.