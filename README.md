<div align="center">
    <h1>🔢 MoeCounter.js - The best counters for your projects</h1>
   
</div>

MoeCounter.js is a JavaScript library that allows for easy integration of attractive visual counters into your web projects or profiles, such as GitHub.
With a variety of appearances and customization options, you can add a unique style to your website or application.
MoeCounter is perfectly suited for use as a view counter, visit counter, online user counter, subscriber counter, follower counter, etc.
It can be seamlessly used on any website or in applications that utilize WebView2.


## 📦 Installation
### NPM (Node.js)
```bash
npm install moecounter.js
```

### Browser
```html
<script src="https://cdn.jsdelivr.net/npm/moecounter.js@1/dist/browser/moecounter.min.js"></script>
```
## 🌍 Demo
[moecounter-showcase.vercel.app](https://moecounter-showcase.vercel.app/)

## 😸 Counters
### Default (gif)
![](https://moecounter.jawandha-moecounter.workers.dev/api/v2/moecounter?theme=default&length=10&number=1234567890)

### Gelbooru (gif)
![](https://moecounter.jawandha-moecounter.workers.dev/api/v2/moecounter?theme=gelbooru&length=10&number=1234567890)

### Asoul (gif)
![](https://moecounter.jawandha-moecounter.workers.dev/api/v2/moecounter?theme=asoul&length=10&number=1234567890)

### Booru Jaypee (gif)
![](https://moecounter.jawandha-moecounter.workers.dev/api/v2/moecounter?theme=booru-jaypee&length=10&number=1234567890)

### Booru Lisu (gif)
![](https://moecounter.jawandha-moecounter.workers.dev/api/v2/moecounter?theme=booru-lisu&length=10&number=1234567890)

### Booru Lewd (gif)
![](https://moecounter.jawandha-moecounter.workers.dev/api/v2/moecounter?theme=booru-lewd&length=10&number=1234567890)

### Booru Quality Hentais (gif)
![](https://moecounter.jawandha-moecounter.workers.dev/api/v2/moecounter?theme=booru-qualityhentais&length=10&number=1234567890)

### Booru SMTG (gif)
![](https://moecounter.jawandha-moecounter.workers.dev/api/v2/moecounter?theme=booru-smtg&length=10&number=1234567890)

## 📃 Documentation
### `moecounter.local(options)`
Generates a visual counter based on the provided options.
Using the local function, developers have the ability to specify the exact value they want to display on the counter.
In such cases, using your own database is recommended.
It's important to note that this function has more lenient query limit restrictions (rate limits).
For the purposes of displaying any kind of statistics, the BELOW method is preferred.

#### options
* `number` - `(default 0)`: The value you want to display on the counter.
* `length` - `(default 10)`: The length of the counter.

### `moecounter.remote(options)`
In this setup, the API server manages the counter.
Developers do not have the capability to modify the counter value.
When a user visits a webpage containing the counter, the counter value will be incremented by 1.
An increment is allowed once every 20 minutes from the same IP address.
If this limit is exceeded, the server will NOT return any HTTP error, but simply will not increase the counter value.

#### options
* `name` - `(required)`: A unique counter name. It is best to choose a unique name that reflects the purpose of the counter. It's also a good idea to add random characters at the end, e.g., `mywebsiteviews-sM7JJb2trEr9`.
* `length` - `(default 10)`: The length of the counter.

## 🤔 Example
```js
const moecounter = require('moecounter.js');

const showMoeCounter = async () => {
	const data = await moecounter.local({
		number: 1234567890,
		length: 10,
		theme: 'default',
		pixelated: true,
		svg: false
	});

	console.log(data);
	// Output:
	// {
	// 	url: 'https://moecounter.jawandha-moecounter.workers.dev/api/v2/moecounter?number=0123456789&length=10'
	// }
}

showMoeCounter();
```

## 🍴 Fork
This project is an enhanced fork of [sefinek/Moe-Counter](https://github.com/sefinek).
It features improved rate limit handling and enhanced server-side code quality.


## 💙 Thank you
If you like this module, please **star** ⭐ the [repository](https://github.com/Gurshan07/moecounter.js).

## 🔑 License
This module is provided under the `MIT License`. See the [LICENSE](LICENSE) file for more details.
