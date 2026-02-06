---
title: "Cron Expression Generator for Java"
description: "Build and validate cron expressions for JobRunr, Quartz, and Spring. See next execution times instantly. Free online tool."
keywords: ["cron expression generator", "cron builder", "java cron expression", "crontab generator", "quartz cron expression", "spring cron expression"]
image: /blog/thumb-cron-generator.jpg
skip_meta: true
---

<style>
.cron-tool {
    max-width: 900px;
    margin: 0 auto;
    font-family: inherit;
}
.cron-input-container {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
}
.cron-input {
    width: 100%;
    font-size: 2rem;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    text-align: center;
    padding: 1rem;
    border: 2px solid #4a5568;
    border-radius: 8px;
    background: #0d1117;
    color: #58a6ff;
    letter-spacing: 0.1em;
}
.cron-input:focus {
    outline: none;
    border-color: #58a6ff;
    box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3);
}
.cron-input.invalid {
    border-color: #f85149;
    color: #f85149;
}
.cron-description {
    text-align: center;
    font-size: 1.5rem;
    color: #fff;
    margin-top: 1rem;
    min-height: 2rem;
}
.cron-fields {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
    margin-top: 1.5rem;
}
.cron-field {
    text-align: center;
    padding: 0.75rem 0.5rem;
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
}
.cron-field-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.25rem;
    color: #58a6ff;
    font-weight: bold;
}
.cron-field-label {
    font-size: 0.75rem;
    color: #8b949e;
    margin-top: 0.25rem;
    text-transform: uppercase;
}
.next-runs {
    background: #f6f8fa;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
}
.next-runs h3 {
    margin: 0 0 1rem 0;
    color: #24292f;
}
.next-runs-list {
    list-style: none;
    padding: 0;
    margin: 0;
}
.next-runs-list li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #d0d7de;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    color: #57606a;
}
.next-runs-list li:last-child {
    border-bottom: none;
}
.presets {
    margin-bottom: 2rem;
}
.presets h3 {
    margin-bottom: 1rem;
}
.preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
}
.preset-btn {
    padding: 0.75rem 1rem;
    border: 1px solid #d0d7de;
    border-radius: 8px;
    background: #fff;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
}
.preset-btn:hover {
    border-color: #58a6ff;
    background: #f6f8fa;
}
.preset-btn code {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    color: #58a6ff;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
}
.preset-btn span {
    font-size: 0.8rem;
    color: #57606a;
}
.reference-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
}
.reference-table th,
.reference-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #d0d7de;
}
.reference-table th {
    background: #f6f8fa;
    font-weight: 600;
}
.reference-table code {
    background: #f6f8fa;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.85rem;
}
.copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #238636;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    margin-top: 1rem;
}
.copy-btn:hover {
    background: #2ea043;
}
.error-message {
    color: #f85149;
    font-size: 0.9rem;
    margin-top: 0.5rem;
    text-align: center;
}
</style>

<div class="cron-tool">
    <div class="cron-input-container">
        <input type="text" id="cronInput" class="cron-input" value="0 9 * * *" placeholder="* * * * *" autocomplete="off" spellcheck="false">
        <div id="cronDescription" class="cron-description">Every day at 9:00 AM</div>
        <div id="errorMessage" class="error-message"></div>
        <div class="cron-fields">
            <div class="cron-field">
                <div class="cron-field-value" id="field-minute">0</div>
                <div class="cron-field-label">Minute</div>
            </div>
            <div class="cron-field">
                <div class="cron-field-value" id="field-hour">9</div>
                <div class="cron-field-label">Hour</div>
            </div>
            <div class="cron-field">
                <div class="cron-field-value" id="field-day">*</div>
                <div class="cron-field-label">Day (Month)</div>
            </div>
            <div class="cron-field">
                <div class="cron-field-value" id="field-month">*</div>
                <div class="cron-field-label">Month</div>
            </div>
            <div class="cron-field">
                <div class="cron-field-value" id="field-weekday">*</div>
                <div class="cron-field-label">Day (Week)</div>
            </div>
        </div>
        <button class="copy-btn" onclick="copyToClipboard()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path></svg>
            Copy Expression
        </button>
    </div>
<div class="next-runs">
<h3>Next 5 Execution Times</h3>
<ul class="next-runs-list" id="nextRuns">
<li>Loading...</li>
</ul>
</div>
<div class="presets">
<h3>Common Presets</h3>
<div class="preset-grid">
<button class="preset-btn" onclick="setPreset('* * * * *')">
<code>* * * * *</code>
<span>Every minute</span>
</button>
<button class="preset-btn" onclick="setPreset('*/5 * * * *')">
<code>*/5 * * * *</code>
<span>Every 5 minutes</span>
</button>
<button class="preset-btn" onclick="setPreset('*/15 * * * *')">
<code>*/15 * * * *</code>
<span>Every 15 minutes</span>
</button>
<button class="preset-btn" onclick="setPreset('0 * * * *')">
<code>0 * * * *</code>
<span>Every hour</span>
</button>
<button class="preset-btn" onclick="setPreset('0 */2 * * *')">
<code>0 */2 * * *</code>
<span>Every 2 hours</span>
</button>
<button class="preset-btn" onclick="setPreset('0 9 * * *')">
<code>0 9 * * *</code>
<span>Daily at 9:00 AM</span>
</button>
<button class="preset-btn" onclick="setPreset('0 0 * * *')">
<code>0 0 * * *</code>
<span>Daily at midnight</span>
</button>
<button class="preset-btn" onclick="setPreset('0 9 * * 1-5')">
<code>0 9 * * 1-5</code>
<span>Weekdays at 9:00 AM</span>
</button>
<button class="preset-btn" onclick="setPreset('0 0 * * 0')">
<code>0 0 * * 0</code>
<span>Weekly (Sunday)</span>
</button>
<button class="preset-btn" onclick="setPreset('0 0 1 * *')">
<code>0 0 1 * *</code>
<span>Monthly (1st)</span>
</button>
<button class="preset-btn" onclick="setPreset('0 0 1 1 *')">
<code>0 0 1 1 *</code>
<span>Yearly (Jan 1st)</span>
</button>
<button class="preset-btn" onclick="setPreset('0 9,17 * * *')">
<code>0 9,17 * * *</code>
<span>9 AM and 5 PM</span>
</button>
</div>
</div>
<h3>Code Examples</h3>

{{< codetabs category="framework" >}}
{{< codetab label="JobRunr" >}}
<pre class="language-java"><code>// Using cron expression
BackgroundJob.scheduleRecurrently("my-job", "<span id="code-cron-1">0 9 * * *</span>",
    () -> myService.doWork());

// Or use the Cron helper class
BackgroundJob.scheduleRecurrently("my-job", Cron.daily(<span id="code-hour">9</span>, <span id="code-minute">0</span>),
    () -> myService.doWork());</code></pre>
{{< /codetab >}}
{{< codetab label="Spring" >}}
<pre class="language-java"><code>@Scheduled(cron = "<span id="code-cron-2">0 0 9 * * *</span>")
public void scheduledTask() {
    myService.doWork();
}

// Note: Spring uses 6 fields (includes seconds)</code></pre>
{{< /codetab >}}
{{< codetab label="Quartz" >}}
<pre class="language-java"><code>CronTrigger trigger = TriggerBuilder.newTrigger()
    .withIdentity("myTrigger")
    .withSchedule(CronScheduleBuilder.cronSchedule("<span id="code-cron-3">0 0 9 * * ?</span>"))
    .build();

// Note: Quartz uses 6-7 fields and ? for day fields</code></pre>
{{< /codetab >}}
{{< /codetabs >}}
<h3>Cron Expression Reference</h3>
<table class="reference-table">
<thead>
<tr>
<th>Field</th>
<th>Values</th>
<th>Special Characters</th>
</tr>
</thead>
<tbody>
<tr>
<td>Minute</td>
<td>0-59</td>
<td><code>*</code> <code>,</code> <code>-</code> <code>/</code></td>
</tr>
<tr>
<td>Hour</td>
<td>0-23</td>
<td><code>*</code> <code>,</code> <code>-</code> <code>/</code></td>
</tr>
<tr>
<td>Day of Month</td>
<td>1-31</td>
<td><code>*</code> <code>,</code> <code>-</code> <code>/</code></td>
</tr>
<tr>
<td>Month</td>
<td>1-12 or JAN-DEC</td>
<td><code>*</code> <code>,</code> <code>-</code> <code>/</code></td>
</tr>
<tr>
<td>Day of Week</td>
<td>0-6 (0=Sunday) or SUN-SAT</td>
<td><code>*</code> <code>,</code> <code>-</code> <code>/</code></td>
</tr>
</tbody>
</table>
<h4>Special Characters</h4>
<table class="reference-table">
<tbody>
<tr>
<td><code>*</code></td>
<td>Any value</td>
</tr>
<tr>
<td><code>,</code></td>
<td>Value list separator (e.g., <code>1,3,5</code>)</td>
</tr>
<tr>
<td><code>-</code></td>
<td>Range (e.g., <code>1-5</code> means 1 through 5)</td>
</tr>
<tr>
<td><code>/</code></td>
<td>Step values (e.g., <code>*/15</code> means every 15)</td>
</tr>
</tbody>
</table>
</div>

<script>
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parseCronExpression(expr) {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) {
        throw new Error('Cron expression must have 5 fields');
    }
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    // Validate each field
    validateField(minute, 0, 59, 'minute');
    validateField(hour, 0, 23, 'hour');
    validateField(dayOfMonth, 1, 31, 'day of month');
    validateField(month, 1, 12, 'month');
    validateField(dayOfWeek, 0, 6, 'day of week');
    
    return { minute, hour, dayOfMonth, month, dayOfWeek };
}

function validateField(value, min, max, name) {
    if (value === '*') return true;
    
    // Handle step values like */5
    if (value.startsWith('*/')) {
        const step = parseInt(value.slice(2));
        if (isNaN(step) || step < 1) throw new Error(`Invalid step in ${name}`);
        return true;
    }
    
    // Handle ranges like 1-5
    if (value.includes('-') && !value.includes(',')) {
        const [start, end] = value.split('-').map(Number);
        if (isNaN(start) || isNaN(end) || start < min || end > max || start > end) {
            throw new Error(`Invalid range in ${name}`);
        }
        return true;
    }
    
    // Handle lists like 1,3,5
    if (value.includes(',')) {
        const values = value.split(',');
        for (const v of values) {
            if (v.includes('-')) {
                const [start, end] = v.split('-').map(Number);
                if (isNaN(start) || isNaN(end) || start < min || end > max) {
                    throw new Error(`Invalid value in ${name}`);
                }
            } else {
                const num = parseInt(v);
                if (isNaN(num) || num < min || num > max) {
                    throw new Error(`Invalid value in ${name}`);
                }
            }
        }
        return true;
    }
    
    // Single value
    const num = parseInt(value);
    if (isNaN(num) || num < min || num > max) {
        throw new Error(`${name} must be between ${min} and ${max}`);
    }
    return true;
}

function describeCron(cron) {
    const { minute, hour, dayOfMonth, month, dayOfWeek } = cron;
    
    let description = '';
    
    // Time part
    if (minute === '*' && hour === '*') {
        description = 'Every minute';
    } else if (minute.startsWith('*/')) {
        const step = minute.slice(2);
        description = `Every ${step} minutes`;
    } else if (hour === '*') {
        description = `At minute ${minute} of every hour`;
    } else if (minute === '0' && !hour.includes(',') && !hour.includes('-') && !hour.includes('/')) {
        const h = parseInt(hour);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
        description = `At ${h12}:00 ${ampm}`;
    } else if (hour.includes(',')) {
        const hours = hour.split(',').map(h => {
            const num = parseInt(h);
            const ampm = num >= 12 ? 'PM' : 'AM';
            const h12 = num === 0 ? 12 : (num > 12 ? num - 12 : num);
            return `${h12} ${ampm}`;
        });
        description = `At ${hours.join(' and ')}`;
    } else {
        const h = parseInt(hour) || 0;
        const m = parseInt(minute) || 0;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
        description = `At ${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    }
    
    // Day part
    if (dayOfWeek !== '*' && dayOfMonth === '*') {
        if (dayOfWeek.includes('-')) {
            const [start, end] = dayOfWeek.split('-').map(Number);
            description += `, ${DAYS[start]} through ${DAYS[end]}`;
        } else if (dayOfWeek.includes(',')) {
            const days = dayOfWeek.split(',').map(d => DAYS[parseInt(d)]);
            description += `, on ${days.join(', ')}`;
        } else {
            description += `, every ${DAYS[parseInt(dayOfWeek)]}`;
        }
    } else if (dayOfMonth !== '*') {
        if (dayOfMonth === '1' && month === '*') {
            description += ', on the 1st of every month';
        } else {
            description += `, on day ${dayOfMonth}`;
        }
    } else if (dayOfWeek === '*' && dayOfMonth === '*') {
        if (!description.includes('minute')) {
            description += ', every day';
        }
    }
    
    // Month part
    if (month !== '*') {
        if (month.includes(',')) {
            const months = month.split(',').map(m => MONTHS[parseInt(m) - 1]);
            description += ` in ${months.join(', ')}`;
        } else {
            description += ` in ${MONTHS[parseInt(month) - 1]}`;
        }
    }
    
    return description;
}

function getNextRuns(expr, count = 5) {
    const cron = parseCronExpression(expr);
    const runs = [];
    let date = new Date();
    date.setSeconds(0);
    date.setMilliseconds(0);
    
    const maxIterations = 10000;
    let iterations = 0;
    
    while (runs.length < count && iterations < maxIterations) {
        date = new Date(date.getTime() + 60000); // Add 1 minute
        iterations++;
        
        if (matchesCron(date, cron)) {
            runs.push(new Date(date));
        }
    }
    
    return runs;
}

function matchesCron(date, cron) {
    return matchesField(date.getMinutes(), cron.minute, 0, 59) &&
           matchesField(date.getHours(), cron.hour, 0, 23) &&
           matchesField(date.getDate(), cron.dayOfMonth, 1, 31) &&
           matchesField(date.getMonth() + 1, cron.month, 1, 12) &&
           matchesField(date.getDay(), cron.dayOfWeek, 0, 6);
}

function matchesField(value, field, min, max) {
    if (field === '*') return true;
    
    if (field.startsWith('*/')) {
        const step = parseInt(field.slice(2));
        return value % step === 0;
    }
    
    if (field.includes(',')) {
        return field.split(',').some(f => matchesField(value, f, min, max));
    }
    
    if (field.includes('-')) {
        const [start, end] = field.split('-').map(Number);
        return value >= start && value <= end;
    }
    
    return parseInt(field) === value;
}

function formatDate(date) {
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleDateString('en-US', options);
}

function updateDisplay() {
    const input = document.getElementById('cronInput');
    const expr = input.value.trim();
    const descEl = document.getElementById('cronDescription');
    const errorEl = document.getElementById('errorMessage');
    const nextRunsEl = document.getElementById('nextRuns');
    
    try {
        const cron = parseCronExpression(expr);
        
        // Update field displays
        document.getElementById('field-minute').textContent = cron.minute;
        document.getElementById('field-hour').textContent = cron.hour;
        document.getElementById('field-day').textContent = cron.dayOfMonth;
        document.getElementById('field-month').textContent = cron.month;
        document.getElementById('field-weekday').textContent = cron.dayOfWeek;
        
        // Update description
        descEl.textContent = describeCron(cron);
        errorEl.textContent = '';
        input.classList.remove('invalid');
        
        // Update next runs
        const nextRuns = getNextRuns(expr);
        nextRunsEl.innerHTML = nextRuns.map(d => `<li>${formatDate(d)}</li>`).join('');
        
        // Update code examples
        document.getElementById('code-cron-1').textContent = expr;
        document.getElementById('code-cron-2').textContent = '0 ' + expr; // Spring adds seconds
        document.getElementById('code-cron-3').textContent = '0 ' + expr.replace(/\*(?=\s|$)/g, (m, i) => {
            // Replace * with ? for day of month or day of week in Quartz
            const fieldIndex = expr.substring(0, expr.indexOf(m)).split(/\s+/).length;
            return (fieldIndex === 2 || fieldIndex === 4) ? '?' : '*';
        });
        
        // Update Cron helper values
        const h = parseInt(cron.hour) || 0;
        const m = parseInt(cron.minute) || 0;
        document.getElementById('code-hour').textContent = h;
        document.getElementById('code-minute').textContent = m;
        
    } catch (e) {
        descEl.textContent = '';
        errorEl.textContent = e.message;
        input.classList.add('invalid');
        nextRunsEl.innerHTML = '<li>Invalid expression</li>';
    }
}

function setPreset(expr) {
    document.getElementById('cronInput').value = expr;
    updateDisplay();
}

function copyToClipboard() {
    const expr = document.getElementById('cronInput').value;
    navigator.clipboard.writeText(expr).then(() => {
        const btn = document.querySelector('.copy-btn');
        const original = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        setTimeout(() => btn.innerHTML = original, 2000);
    });
}

// Initialize
document.getElementById('cronInput').addEventListener('input', updateDisplay);
updateDisplay();
</script>
