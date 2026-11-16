---
title: "Cron Expression Generator for Java"
description: "Build and validate cron expressions for JobRunr, Quartz, and Spring, or convert a Quartz cron expression to a JobRunr cron. See next execution times instantly. Free online tool."
keywords: ["cron expression generator", "cron builder", "java cron expression", "crontab generator", "quartz cron expression", "spring cron expression", "quartz cron converter", "convert quartz cron", "quartz to jobrunr cron"]
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
.quartz-banner {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.4rem 0.75rem;
    width: 100%;
    padding: 0.75rem 1.25rem;
    margin-bottom: 1rem;
    border: 1px solid #d9cdfb;
    border-radius: 12px;
    background: #f5f1ff;
    color: #24292f;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
}
.quartz-banner:hover {
    border-color: #7c4ddb;
    background: #efe8ff;
}
.quartz-banner-cta {
    color: #6b3fd4;
    font-weight: 600;
    white-space: nowrap;
}
.quartz-panel {
    border: 1px solid #d9cdfb;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    background: #fff;
}
.quartz-panel[hidden] {
    display: none;
}
.quartz-panel h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.5rem;
}
.quartz-panel p {
    margin: 0 0 1rem 0;
    color: #57606a;
    font-size: 0.95rem;
}
.quartz-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 0.75rem;
    align-items: end;
}
.quartz-grid label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #57606a;
    margin-bottom: 0.35rem;
}
.quartz-arrow {
    font-size: 1.5rem;
    color: #7c4ddb;
    padding-bottom: 0.6rem;
}
.quartz-input,
.quartz-output {
    width: 100%;
    font-size: 1.15rem;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    text-align: center;
    padding: 0.75rem;
    border: 2px solid #4a5568;
    border-radius: 8px;
    background: #0d1117;
    color: #58a6ff;
    height: 3.25rem;
    line-height: 1.2;
    box-sizing: border-box;
}
.quartz-input:focus {
    outline: none;
    border-color: #58a6ff;
    box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.3);
}
.quartz-output {
    color: #7ee787;
    white-space: nowrap;
    overflow-x: auto;
}
.quartz-examples {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    font-size: 0.8rem;
    color: #57606a;
}
.quartz-example {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8rem;
    padding: 0.25rem 0.6rem;
    border: 1px solid #d0d7de;
    border-radius: 999px;
    background: #fff;
    color: #24292f;
    cursor: pointer;
}
.quartz-example:hover {
    border-color: #7c4ddb;
}
.quartz-tier {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
}
.quartz-tier.oss {
    background: #dafbe1;
    color: #116329;
}
.quartz-tier.pro {
    background: #ede5ff;
    color: #5a32b8;
}
.quartz-tier.error {
    background: #ffebe9;
    color: #b42318;
}
.quartz-notes {
    list-style: none;
    padding: 0;
    margin: 0.75rem 0 0 0;
}
.quartz-notes li {
    padding: 0.5rem 0 0.5rem 0.9rem;
    margin: 0 0 0.4rem 0;
    border-left: 3px solid #d0d7de;
    font-size: 0.9rem;
    color: #24292f;
}
.quartz-notes li.pro {
    border-left-color: #7c4ddb;
}
.quartz-notes li.warn {
    border-left-color: #d4a72c;
    background: #fff8c5;
}
.quartz-notes li.error {
    border-left-color: #f85149;
    background: #ffebe9;
}
.quartz-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.5rem;
}
.quartz-actions .copy-btn {
    margin-top: 0.5rem;
}
.quartz-secondary-btn {
    padding: 0.5rem 1rem;
    margin-top: 0.5rem;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    background: #fff;
    color: #24292f;
    font-size: 0.9rem;
    cursor: pointer;
}
.quartz-secondary-btn:hover {
    border-color: #7c4ddb;
}
.quartz-secondary-btn[hidden] {
    display: none;
}
.quartz-guide {
    margin: 1rem 0 0 0 !important;
    font-size: 0.85rem !important;
}
@media (max-width: 700px) {
    .quartz-grid {
        grid-template-columns: 1fr;
    }
    .quartz-arrow {
        display: none;
    }
    .cron-input {
        font-size: 1.4rem;
    }
}
</style>

<div class="cron-tool">
    <button type="button" class="quartz-banner" id="quartzToggle" aria-expanded="false" aria-controls="quartz-converter" onclick="toggleQuartzConverter()">
        <span>Looking to convert a Quartz cron to a JobRunr cron?</span>
        <span class="quartz-banner-cta" id="quartzToggleCta">Convert it here &rarr;</span>
    </button>
    <div class="quartz-panel" id="quartz-converter" hidden>
        <h3>Quartz to JobRunr cron converter</h3>
        <p>Paste a Quartz cron expression. You get the JobRunr cron, what changed, and whether it runs on JobRunr OSS or needs the advanced cron expressions of JobRunr Pro.</p>
        <div class="quartz-grid">
            <div>
                <label for="quartzInput">Quartz cron</label>
                <input type="text" id="quartzInput" class="quartz-input" value="0 0 9 ? * 2-6" placeholder="0 0 9 ? * 2-6" autocomplete="off" spellcheck="false">
            </div>
            <div class="quartz-arrow" aria-hidden="true">&rarr;</div>
            <div>
                <label for="quartzOutput">JobRunr cron</label>
                <output id="quartzOutput" class="quartz-output" for="quartzInput" style="display:block"></output>
            </div>
        </div>
        <div class="quartz-examples">
            <span>Try:</span>
            <button type="button" class="quartz-example" onclick="setQuartzExample('0 0 9 ? * 2-6')">0 0 9 ? * 2-6</button>
            <button type="button" class="quartz-example" onclick="setQuartzExample('0 0/15 * * * ?')">0 0/15 * * * ?</button>
            <button type="button" class="quartz-example" onclick="setQuartzExample('30 0 2 1 * ? *')">30 0 2 1 * ? *</button>
            <button type="button" class="quartz-example" onclick="setQuartzExample('0 0 0 L * ?')">0 0 0 L * ?</button>
            <button type="button" class="quartz-example" onclick="setQuartzExample('0 0 10 ? * 6#3')">0 0 10 ? * 6#3</button>
            <button type="button" class="quartz-example" onclick="setQuartzExample('0 30 8 15W * ?')">0 30 8 15W * ?</button>
        </div>
        <div><span class="quartz-tier" id="quartzTier"></span></div>
        <ul class="quartz-notes" id="quartzNotes"></ul>
        <div class="quartz-actions">
            <button type="button" class="copy-btn" id="quartzCopy" onclick="copyQuartzResult()">Copy JobRunr cron</button>
            <button type="button" class="quartz-secondary-btn" id="quartzUse" onclick="useQuartzResult()" hidden>See the next runs in the generator</button>
        </div>
        <p class="quartz-guide">Moving the whole scheduler and not just one expression? Read <a href="/en/blog/2023-02-20-moving-from-quartz-scheduler-to-jobrunr/">how to move from Quartz to JobRunr</a>.</p>
    </div>
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
        document.getElementById('code-cron-3').textContent = toQuartzCron(cron);
        
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

// Standard cron to Quartz, for the Quartz code example.
// Quartz needs ? in one of the day fields and counts weekdays 1-7 from Sunday.
function toQuartzCron(cron) {
    let dayOfMonth = cron.dayOfMonth;
    let dayOfWeek = cron.dayOfWeek;
    if (dayOfWeek === '*') {
        dayOfWeek = '?';
    } else {
        dayOfWeek = dayOfWeek.replace(/(?<![\/\d])([0-6])(?!\d)/g, d => String(parseInt(d) + 1));
        if (dayOfMonth === '*') dayOfMonth = '?';
    }
    return ['0', cron.minute, cron.hour, dayOfMonth, cron.month, dayOfWeek].join(' ');
}

// ---- Quartz to JobRunr converter ----
const DOW_ABBR = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth'];
const ADVANCED_CRON_DOCS = '/en/documentation/background-methods/recurring-jobs/#advanced-cron-expressions';
const CUSTOM_SCHEDULE_DOCS = '/en/documentation/background-methods/recurring-jobs/#custom-recurring-job-schedules';
const LIMITED_LIFETIME_DOCS = '/en/documentation/background-methods/recurring-jobs/#recurring-jobs-with-limited-lifetime';

function quartzError(text, link) {
    const error = new Error(text);
    error.link = link;
    return error;
}

// Quartz accepts ranges that wrap around (FRI-MON, 22-2). JobRunr wants the lower value first.
function unwrapRanges(field, min, max, names) {
    const toNumber = v => (names && names.includes(v)) ? names.indexOf(v) + min : (/^\d+$/.test(v) ? parseInt(v) : NaN);
    return field.split(',').map(part => {
        const range = part.match(/^([A-Z0-9]+)-([A-Z0-9]+)$/);
        if (!range) return part;
        const start = toNumber(range[1]), end = toNumber(range[2]);
        if (isNaN(start) || isNaN(end) || start <= end) return part;
        return (start === max ? max : start + '-' + max) + ',' + (end === min ? min : min + '-' + end);
    }).join(',');
}

function convertQuartzCron(expr) {
    const fields = expr.trim().split(/\s+/);
    if (expr.trim() === '') {
        throw quartzError('Paste a Quartz cron expression to convert it.');
    }
    if (fields.length === 5) {
        throw quartzError('This has 5 fields, so it is a standard cron expression already. JobRunr takes it as is, and you can check it in the generator below.');
    }
    if (fields.length < 6 || fields.length > 7) {
        throw quartzError('A Quartz cron expression has 6 or 7 fields: second, minute, hour, day of month, month, day of week and an optional year.');
    }
    if (!fields.every(f => /^[0-9A-Za-z*?,\-\/#]+$/.test(f))) {
        throw quartzError('This contains characters that are not valid in a Quartz cron expression.');
    }

    const notes = [];
    let pro = false;
    const year = fields[6];
    let sec = fields[0], min = fields[1], hour = fields[2], month = fields[4].toUpperCase();
    let dom = fields[3].toUpperCase();
    let dow = fields[5].toUpperCase();

    // Day of month
    const hadQuestionMark = dom === '?' || dow === '?';
    if (dom === '?') {
        dom = '*';
    } else if (dom === 'L') {
        pro = true;
        notes.push({ type: 'pro', text: 'L in the day-of-month field (the last day of the month) is a JobRunr Pro advanced cron expression.' });
    } else if (/^\d+W$/.test(dom)) {
        pro = true;
        notes.push({ type: 'pro', text: dom + ' (the weekday nearest to day ' + parseInt(dom) + ') is a JobRunr Pro advanced cron expression.' });
        if (parseInt(dom) > 28) {
            notes.push({ type: 'warn', text: 'Not every month has a day ' + parseInt(dom) + '. Quartz skips the months that do not, so test this expression on your JobRunr Pro version before you rely on it.' });
        }
    } else if (/[LW]/.test(dom)) {
        throw quartzError(dom + ' in the day-of-month field has no JobRunr cron equivalent. Use a custom schedule in JobRunr Pro, or schedule the job daily and check the date inside the job.',
            { label: 'Custom schedules', href: CUSTOM_SCHEDULE_DOCS });
    }

    // Day of week
    if (dow === '?') {
        dow = '*';
    } else if (dow === 'L') {
        dow = '6';
        notes.push({ type: 'change', text: 'A lone L in the Quartz day-of-week field means Saturday, which is 6 in JobRunr.' });
    } else {
        const named = dow.match(/^([A-Z]{3})(L|#\d)$/);
        if (named && DOW_ABBR.includes(named[1])) {
            dow = DOW_ABBR.indexOf(named[1]) + named[2];
        } else {
            const shifted = dow.replace(/(?<![\/#\d])([1-7])(?!\d)/g, d => String(parseInt(d) - 1));
            if (shifted !== dow) {
                notes.push({ type: 'change', text: 'Day-of-week numbers moved down by one: ' + dow + ' became ' + shifted + '. Quartz counts 1 to 7 starting on Sunday, JobRunr counts 0 to 6. Copy the numbers unchanged and the job silently runs a day late.' });
            }
            const unwrapped = unwrapRanges(shifted, 0, 6, DOW_ABBR);
            if (unwrapped !== shifted) {
                notes.push({ type: 'change', text: 'The day-of-week range ' + fields[5].toUpperCase() + ' wraps around the end of the week. JobRunr wants the lower value first, so it became ' + unwrapped + '.' });
            }
            dow = unwrapped;
        }
        const last = dow.match(/^([0-6])L$/);
        const nth = dow.match(/^([0-6])#(\d)$/);
        if (last) {
            pro = true;
            notes.push({ type: 'pro', text: dow + ' (the last ' + DAYS[last[1]] + ' of the month) is a JobRunr Pro advanced cron expression.' });
        } else if (nth && nth[2] >= 1 && nth[2] <= 5) {
            pro = true;
            notes.push({ type: 'pro', text: dow + ' (the ' + ORDINALS[nth[2]] + ' ' + DAYS[nth[1]] + ' of the month) is a JobRunr Pro advanced cron expression.' });
        } else if (/[L#]/.test(dow)) {
            throw quartzError(fields[5] + ' is not a valid Quartz day-of-week value.');
        }
    }
    // Wrap-around ranges in the other fields
    const wraps = [];
    const unwrap = (label, value, min, max, names) => {
        const unwrapped = unwrapRanges(value, min, max, names);
        if (unwrapped !== value) wraps.push(label + ' ' + value + ' became ' + unwrapped);
        return unwrapped;
    };
    sec = unwrap('second', sec, 0, 59);
    min = unwrap('minute', min, 0, 59);
    hour = unwrap('hour', hour, 0, 23);
    month = unwrap('month', month, 1, 12, MONTH_ABBR);
    if (wraps.length) {
        notes.push({ type: 'change', text: 'A range wraps around, and JobRunr wants the lower value first: ' + wraps.join(', ') + '.' });
    }
    if (hadQuestionMark) {
        notes.unshift({ type: 'change', text: 'Replaced ? with *. JobRunr does not use the ? placeholder.' });
    }
    if (dom !== '*' && dow !== '*') {
        notes.push({ type: 'warn', text: 'Both day fields are set. JobRunr runs the job when either one matches, like Unix cron.' });
    }

    // Year
    if (year !== undefined) {
        if (year === '*' || year === '?') {
            notes.push({ type: 'change', text: 'Dropped the year field. A JobRunr cron expression has no year.' });
        } else {
            notes.push({ type: 'warn', text: 'Dropped the year ' + year + '. A JobRunr cron expression has no year, so this job keeps running every year. Delete the recurring job when it should stop, or give it a limited lifetime in JobRunr Pro.',
                link: { label: 'Limited lifetime', href: LIMITED_LIFETIME_DOCS } });
        }
    }

    // Seconds
    let result;
    if (sec === '0') {
        result = [min, hour, dom, month, dow];
        notes.push({ type: 'change', text: 'Dropped the seconds field because it is 0. JobRunr reads 5 fields as minute, hour, day, month and weekday.' });
    } else {
        result = [sec, min, hour, dom, month, dow];
        notes.push({ type: 'change', text: 'Kept the seconds field. JobRunr reads 6 fields with the seconds first.' });
        const step = sec.match(/\/(\d+)$/);
        if (sec === '*' || (step && parseInt(step[1]) < 5)) {
            notes.push({ type: 'warn', text: 'This runs more often than every 5 seconds. A JobRunr recurring job needs at least 5 seconds between runs, and ideally more than the poll interval (15 seconds by default).' });
        }
    }

    return { cron: result.join(' '), notes, pro };
}

function renderQuartzNote(note) {
    const li = document.createElement('li');
    li.className = note.type;
    li.textContent = note.text;
    if (note.link) {
        const a = document.createElement('a');
        a.href = note.link.href;
        a.textContent = note.link.label;
        li.append(' ', a);
    }
    return li;
}

function updateQuartzConverter() {
    const outputEl = document.getElementById('quartzOutput');
    const tierEl = document.getElementById('quartzTier');
    const notesEl = document.getElementById('quartzNotes');
    const copyEl = document.getElementById('quartzCopy');
    const useEl = document.getElementById('quartzUse');
    notesEl.innerHTML = '';
    tierEl.innerHTML = '';

    try {
        const converted = convertQuartzCron(document.getElementById('quartzInput').value);
        outputEl.textContent = converted.cron;
        copyEl.hidden = false;
        if (converted.pro) {
            tierEl.className = 'quartz-tier pro';
            const a = document.createElement('a');
            a.href = ADVANCED_CRON_DOCS;
            a.textContent = 'advanced cron expressions';
            tierEl.append('Needs JobRunr Pro: ', a);
        } else {
            tierEl.className = 'quartz-tier oss';
            tierEl.textContent = 'Works in JobRunr OSS and Pro';
        }
        converted.notes.forEach(note => notesEl.appendChild(renderQuartzNote(note)));

        // The generator below handles plain 5-field numeric expressions.
        let fitsGenerator = true;
        try { parseCronExpression(converted.cron); } catch (e) { fitsGenerator = false; }
        useEl.hidden = !fitsGenerator;
    } catch (e) {
        outputEl.textContent = '';
        copyEl.hidden = true;
        useEl.hidden = true;
        tierEl.className = 'quartz-tier error';
        tierEl.textContent = 'Not converted';
        notesEl.appendChild(renderQuartzNote({ type: 'error', text: e.message, link: e.link }));
    }
}

function toggleQuartzConverter(forceOpen) {
    const panel = document.getElementById('quartz-converter');
    const toggle = document.getElementById('quartzToggle');
    const open = forceOpen === true ? true : panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    document.getElementById('quartzToggleCta').innerHTML = open ? 'Hide the converter' : 'Convert it here &rarr;';
    if (open) {
        updateQuartzConverter();
        document.getElementById('quartzInput').focus({ preventScroll: true });
    }
}

function setQuartzExample(expr) {
    document.getElementById('quartzInput').value = expr;
    updateQuartzConverter();
}

function copyQuartzResult() {
    const btn = document.getElementById('quartzCopy');
    navigator.clipboard.writeText(document.getElementById('quartzOutput').textContent).then(() => {
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = 'Copy JobRunr cron', 2000);
    });
}

function useQuartzResult() {
    setPreset(document.getElementById('quartzOutput').textContent);
    document.getElementById('cronInput').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Initialize
document.getElementById('cronInput').addEventListener('input', updateDisplay);
document.getElementById('quartzInput').addEventListener('input', updateQuartzConverter);
updateDisplay();
// Deep link: /cron-expression-generator/#quartz opens the converter.
if (window.location.hash === '#quartz') {
    toggleQuartzConverter(true);
}
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#quartz') toggleQuartzConverter(true);
});
</script>
