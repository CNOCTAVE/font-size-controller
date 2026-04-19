# font-size-controller
# 字体大小控制器（大字版）

一个简单的 Visual Studio Code 插件，可以修改VSCode编辑区域的字号大小，适合在直播、演讲、学术报告和日常编码中使用。

## 特性

* 在VSCode窗口的右下角有一个“设置字号”按钮。点击即可调节VSCode编辑区域的字号大小。
* 字号分为大字、中字和小字三个预设档位。
* 大字适合演讲、中字适合日常编码、小字适合查看大量代码。
* 字号支持自由调节。
* 支持一键恢复默认字号。

---
# font-size-controller Document
 Check out document: [font-size-controller Document](https://cnoctave.github.io/font-size-controller/index.html)
# How to translate font-size-controller Document into another language
 In ./docs directory, index.html is zh-CN simplified Chinese document. 
 For example, if you want to translate document into English.
 1. Copy index.html as another document with different language code as filename, 
 for example, en-US.html.
 2. Translate en-US.html into English.
 3. Add dropdown like the picture below to every *.html. 
 For example, add dropdown "en-US English".  
 ![the dropdown looking](./docs/pic/translate_dropdown.png)  
 The code for adding dropdown is like the picture below.  
 ![the dropdown code](./docs/pic/translate_dropdown_code.png) 
 4. There are 2 jquery4.json copies in this repository. 
 One is for VSCode extension, the other one is for this document. 
 Copy the jquery4.json which you modified onto another jquery4.json. 
 5. PR to font-size-controller.