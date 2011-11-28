var HtmlConsole = {};

HtmlConsole.stylesheetData = (function() {
	var css = 
		"#error-console {\n" +
		"  position: relative;\n"+
		"  font-size: 9pt;\n"+
		"  border: 1px solid gray;\n" +
		"  width: 800px;\n" +
		"  margin: 0 auto;\n" +
		"  margin-top: 0.8em;\n" +
		"  margin-bottom: 0.8em;\n" + 
		"  font-family: monospace;\n" +
		"}\n\n" +
		"#error-console div.ec-messages {\n" +
		"  max-height: 200px;\n" +
		"  overflow: auto;\n" +
		"  padding: 6px;\n" +
		"}\n\n" +
		"#error-console div.ec-caption {\n" +
		"  position: absolute;\n"+
		"  top: -0.8em;\n"+
		"  right: 18px;\n"+
		"  padding: 2px;\n"+
		"  background-color: #DDD;\n"+
		"  border: 1px solid gray\n"+
		"}\n\n"+
		"#error-console p {\n" +
		"  border-top: 1px dotted gray;\n" +
		"  border-bottom: 1px dotted gray;\n" +
		"  margin: 0;\n" + 
		"  margin-bottom: 3px;\n" +
		"  padding: 6px 0px;\n" +
		"}\n\n";
	return css;
})();


HtmlConsole.addMessage = function(msg) {
	var ec = document.getElementById("error-console"),
		p = document.createElement('p'),
		messages;
	p.innerHTML = msg.replace(/\n/g, "<br>");
	if (ec) {
		messages = ec.children[1];
		messages.appendChild(p);
		ec.style.display = "";
	}
	messages.scrollTop = messages.scrollHeight;
};


HtmlConsole.createHtmlConsole = function() {
	var body = document.getElementsByTagName('body')[0],
		fragment = document.createDocumentFragment(),
		div = document.createElement('div'),
		title = document.createElement('div'),
		messages = document.createElement('div'),
		child;
	
	div.setAttribute("id", "error-console");
	div.style.display = "none";	

	title.setAttribute("class", "ec-caption");
	title.appendChild(document.createTextNode("Error Console"));
	
	messages.setAttribute("class", "ec-messages");
	
	div.appendChild(title);
	div.appendChild(messages);
	fragment.appendChild(div);

	child = body.childNodes[0];
	if (child) {
		body.insertBefore(fragment, child);
	} else {
		body.appendChild(fragment);
	}
};


HtmlConsole.overrideConsole = function() {
	if (typeof console == "undefined") {
		window.console = {};
	}

	var oldlog = console.log;
	console.log = function(msg) {
		HtmlConsole.addMessage(msg);
		if (oldlog) {
			oldlog(msg);
		}
	}
};


HtmlConsole.createCSS = function() {
	var css = document.createElement('style'),
		head = document.getElementsByTagName('head')[0];
	css.type = "text/css";
	css.media = "screen";
	
	// Another IE oddity here.
	if (css.styleSheet) {
		css.styleSheet.cssText = HtmlConsole.stylesheetData;
	} else {
		css.appendChild(document.createTextNode(HtmlConsole.stylesheetData));
	}
	
	head.appendChild(css);
}


HtmlConsole.errorList = [];

HtmlConsole.onError = function(msg, url, line) {
	var ec = document.getElementById("error-console"),
		x = "", prop;

	if (msg.message) {
		url = msg.filename;
		line = msg.lineno;
		msg = msg.message;
	}
	
	if (ec) {
		HtmlConsole.addMessage("<b>["+url+":"+line+"]</b> "+msg);
		if (HtmlConsole.oldOnError) {
			return HtmlConsole.oldOnError(msg, url, line);
		}
	} else {
		HtmlConsole.errorList.push("<b>["+url+":"+line+"]</b> "+msg);
	}

	// Firefox and Chrome expect false to propagate, the rest expect true...
	if (/(Firefox|Chrome)/.test(navigator.userAgent)) {
		return false;
	}
	return true;
};


HtmlConsole.onLoad = function() {
	HtmlConsole.createHtmlConsole();
	if (HtmlConsole.oldOnLoad) {
		HtmlConsole.oldOnLoad();
	}
	while (HtmlConsole.errorList.length > 0) {
		HtmlConsole.addMessage(HtmlConsole.errorList.pop());
	}
};

/*
 * Trust me when I say this is really the only way to make this work.
 * 
 * On Firefox, the event handler will be passed an event object, not the error
 * messages as expected. Sadface.
 */
HtmlConsole.oldOnLoad = window.onload;
HtmlConsole.oldOnError = window.onerror;
window.onload =	HtmlConsole.onLoad;
window.onerror = HtmlConsole.onError;

HtmlConsole.overrideConsole();
HtmlConsole.createCSS();

