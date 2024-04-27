# mtrpzLab1

## Application description
This code is designed to process files in Markdown format. It reads the contents of the file, applies formatting (bold, italic, monospaced) according to the markers, and then saves or outputs the processed contents.

---
## How to build a project

**Installation**
```
git clone https://github.com/aleksandrgarachun/mtrpzLab1.git
git checkout lab2
```
to install dependencies use the command
```
npm install
```

**To run the application**
```
node index.mjs -f=<format (html|esc)> <file path.md>
```

**To run test**
```
npm test
```

# Example

```markdown
Звірята з різних країн збирались **разом**, щоб обговорити, хто з них найбільший _ледащо_.
Ледача **лисиця** з Африки почала своє: `Я так ледарю, що як мені хочеться поганяти зайця, я лежу в тіні і чекаю, поки зайці самі прибігають до мене!`
Всі звірі **поглянули** на неї та _засміялись_.
Але потім **величезний** ледачий панда піднявся: `Ви всі нічого не знаєте про ледарство, як я вставаю зранку, перше, що я роблю, - це з'їдаю свій сніданок, потім я втомлююся від цього і повертаюся спати, після довгої дрімоти я прокидаюся і думаю, що настав час обіду`.
І коли я закінчую обід, я знову йду **спати**, після дрімоти _мені_ знову хочеться погуляти, але я втомлююся і знову лягаю спати.
Після _тих слів всі_ звірі **мовчки** поглянули на панду, `здивовані` його безглуздістю.
Нарешті, один маленький **ведмідь** з задньої лавки _підняв лапу_ і сказав: `Друзі, давайте не будемо сперечатись, послухайте лише, як я вчора прокинувся, хотів піти до лісу, але вирішив ще немного поспати, і ось я тут з вами`, ось така _історія_.
```

# HTML result

```html
<pre>
<p>Звірята з різних країн збирались <b>разом</b>, щоб обговорити, хто з них найбільший <i>ледащо</i>.</p>
<p>Ледача <b>лисиця</b> з Африки почала своє: `Я так ледарю, що як мені хочеться поганяти зайця, я лежу в тіні і чекаю, поки зайці самі прибігають до мене!`</p>
<p>Всі звірі <b>поглянули</b> на неї та <i>засміялись</i>.</p>
<p>Але потім <b>величезний</b> ледачий панда піднявся: <tt>Ви всі нічого не знаєте про ледарство, як я вставаю зранку, перше, що я роблю, - це з'їдаю свій сніданок, потім я втомлююся від цього і повертаюся спати, після довгої дрімоти я прокидаюся і думаю, що настав час обіду</tt>.</p>
<p>І коли я закінчую обід, я знову йду <b>спати</b>, після дрімоти <i>мені</i> знову хочеться погуляти, але я втомлююся і знову лягаю спати.</p>
<p>Після <i>тих слів всі</i> звірі <b>мовчки</b> поглянули на панду, <tt>здивовані</tt> його безглуздістю.</p>
<p>Нарешті, один маленький <b>ведмідь</b> з задньої лавки <i>підняв лапу</i> і сказав: <tt>Друзі, давайте не будемо сперечатись, послухайте лише, як я вчора прокинувся, хотів піти до лісу, але вирішив ще немного поспати, і ось я тут з вами</tt>, ось така <i>історія малята</i>.</p>
</pre>
```


---
## Revert Commit
[Link](https://github.com/aleksandrgarachun/mtrpzLab1/commit/0c11ac94965392cde2600840c2038348ac829c10)

## Successfull tests
[Link](https://github.com/aleksandrgarachun/mtrpzLab1/commit/75c01f68e3dcf20f6f87c4cbc3634f782af2d85c)

## Faulty tests
[Link](https://github.com/aleksandrgarachun/mtrpzLab1/commit/40e25c4d06fa52896254f7a498b9c23e5c4c118a)

## Pull request
In progress!

