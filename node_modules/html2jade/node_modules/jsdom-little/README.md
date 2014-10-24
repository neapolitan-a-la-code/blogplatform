[![Build Status](https://travis-ci.org/dorny/jsdom-little.png?branch=master)](https://travis-ci.org/dorny/jsdom-little)

# jsdom-little
Lightweight cut down version of [jsdom](https://github.com/tmpvar/jsdom).

## Removed dependencies:
* **contextify**
* xmlhttprequest
* request

## Removed features:
* Running JavaScript code in browser context
* Fetching or processing external resources
* Window
* Events
* XmlHttpRequest
* Content of `<style>` nodes is not evaluated
* jsdom.env works only as ```jsdom.env(html, level, callback)``` and returns ```{document: document}```

## What it is good for?
* You need something from jsdom (DOM, parsing, etc.) but full browser emulation is overkill.

## Why not use original jsdom?
* jsdom uses native module [contextify](https://github.com/brianmcd/contextify), see [link](https://github.com/tmpvar/jsdom#contextify).
