Ext.data.JsonP.testing_cmd_application({"guide":"<h2 id='testing_cmd_application-section-intro'>Intro</h2>\n<div class='toc'>\n<p><strong>Contents</strong></p>\n<ol>\n<li><a href='#!/guide/testing_cmd_application-section-intro'>Intro</a></li>\n<li><a href='#!/guide/testing_cmd_application-section-generating-a-sencha-cmd-6-app'>Generating A Sencha Cmd 6 App</a></li>\n<li><a href='#!/guide/testing_cmd_application-section-creating-your-test-harness'>Creating Your Test Harness</a></li>\n<li><a href='#!/guide/testing_cmd_application-section-writing-a-basic-unit-test'>Writing a Basic Unit Test</a></li>\n<li><a href='#!/guide/testing_cmd_application-section-creating-an-application-smoke-test'>Creating an Application Smoke Test</a></li>\n<li><a href='#!/guide/testing_cmd_application-section-verifying-presence-of-an-alert-dialog'>Verifying Presence Of an Alert Dialog</a></li>\n<li><a href='#!/guide/testing_cmd_application-section-conclusion'>Conclusion</a></li>\n<li><a href='#!/guide/testing_cmd_application-section-buy-this-product'>Buy this product</a></li>\n<li><a href='#!/guide/testing_cmd_application-section-support'>Support</a></li>\n<li><a href='#!/guide/testing_cmd_application-section-see-also'>See also</a></li>\n<li><a href='#!/guide/testing_cmd_application-section-attribution'>Attribution</a></li>\n<li><a href='#!/guide/testing_cmd_application-section-copyright-and-license'>COPYRIGHT AND LICENSE</a></li>\n</ol>\n</div>\n\n<p>Most applications written with the Sencha libraries (Ext JS and Sencha Touch) are generated using Sencha Cmd.\nWe therefore decided to write a 'How-to-guide' to get you started with your javascript testing.</p>\n\n<h2 id='testing_cmd_application-section-generating-a-sencha-cmd-6-app'>Generating A Sencha Cmd 6 App</h2>\n\n<p>First of all, make sure you have the latest Cmd version installed. You can download it\n<a href=\"https://www.sencha.com/products/extjs/cmd-download/\" target=\"_blank\">here</a>.\nLet's start from scratch by generating a new Sencha Cmd 6 application, this is done by running the following on\nthe command line (from the\n<a href=\"https://docs.sencha.com/extjs/6.0/getting_started/getting_started.html\" target=\"_blank\">Sencha getting started guide</a>):</p>\n\n<pre><code>sencha -sdk /path/to/extjs/framework generate app MyApp MyApp\ncd MyApp\nsencha app watch\n</code></pre>\n\n<p>This will generate the following files in the MyApp folder in your file system.</p>\n\n<p><img src=\"guides/testing_cmd_application/images/filesystem.png\" width=\"350\" /></p>\n\n<p>As you can see we get an app folder with 'model', 'store' and 'view' folders along with an app.js which bootstraps the application.\nIf you navigate to <code>http://localhost:1841</code> in your browser, you'll see the sample application with a few tabs and a grid panel.</p>\n\n<p><img src=\"guides/testing_cmd_application/images/app.png\" width=\"600\" /></p>\n\n<h2 id='testing_cmd_application-section-creating-your-test-harness'>Creating Your Test Harness</h2>\n\n<p>Now that the app is up and running, we create a tests folder in the root of the MyApp folder. Inside it we put our harness HTML page which contains the Siesta application, and a Harness JS file which contains details about the test suite:</p>\n\n<pre><code>&lt;!DOCTYPE html&gt;\n&lt;html&gt;\n    &lt;head&gt;\n        &lt;link rel=\"stylesheet\" type=\"text/css\" href=\"localhost/siesta/resources/css/siesta-all.css\"&gt;\n        &lt;script type=\"text/javascript\" src=\"localhost/siesta/siesta-all.js\"&gt;&lt;/script&gt;\n\n        &lt;!-- The test harness --&gt;\n        &lt;script type=\"text/javascript\" src=\"index.js\"&gt;&lt;/script&gt;\n    &lt;/head&gt;\n    &lt;body&gt;\n    &lt;/body&gt;\n&lt;/html&gt; \n</code></pre>\n\n<p>This is the Harness JS file:</p>\n\n<pre><code>var harness = new <a href=\"#!/api/Siesta.Harness.Browser.ExtJS\" rel=\"Siesta.Harness.Browser.ExtJS\" class=\"docClass\">Siesta.Harness.Browser.ExtJS</a>()\n\nharness.configure({\n    title              : 'My Tests'\n});\n\nharness.start(\n    {\n        group       : 'Unit Tests',\n        pageUrl     : '../index.html?unittest',\n        items       : [\n            'unit-tests/unit1.t.js'\n        ]\n    },\n    {\n        group : 'Application Tests',\n        items : [\n        ]\n    }\n);\n</code></pre>\n\n<p>For our unit tests, we first need to make sure all our application JS classes get injected into each test.\nInstead of using <a href=\"#!/api/Siesta.Harness.Browser-cfg-preload\" rel=\"Siesta.Harness.Browser-cfg-preload\" class=\"docClass\">Siesta.Harness.Browser.preload</a> for this, with Ext JS 6 we use <a href=\"#!/api/Siesta.Harness.Browser-cfg-pageUrl\" rel=\"Siesta.Harness.Browser-cfg-pageUrl\" class=\"docClass\">Siesta.Harness.Browser.pageUrl</a>\nand set it to the root index.html page. By doing this, we let Ext JS choose and load the application files as it sees fit.\nWe could've also selected to include only the JS classes being tested in each test, but this would require too much effort.\nIf you run the test above, you'll note that the application will start which is of course not desirable when doing unit tests.\nTo fix this, we simply modify our app.js a little bit.</p>\n\n<pre><code>/*\n * This file is generated and updated by Sencha Cmd. You can edit this file as\n * needed for your application, but these edits will have to be merged by\n * Sencha Cmd when upgrading.\n */\nExt.application({\n    name: 'MyApp',\n\n    extend: 'MyApp.Application',\n\n    requires: [\n        'MyApp.view.main.Main'\n    ],\n\n    // The name of the initial view to create. With the classic toolkit this class\n    // will gain a \"viewport\" plugin if it does not extend Ext.Viewport. With the\n    // modern toolkit, the main view will be added to the Viewport.\n    //\n    mainView: location.search.match('unittest') ? null : 'MyApp.view.main.Main'\n\n    //-------------------------------------------------------------------------\n    // Most customizations should be made to MyApp.Application. If you need to\n    // customize this file, doing so below this section reduces the likelihood\n    // of merge conflicts when upgrading to new versions of Sencha Cmd.\n    //-------------------------------------------------------------------------\n});\n</code></pre>\n\n<p>We simply add an inline check for the presence of a 'unittest' string in the query string. If this string exists, we prevent\nthe application from starting. Now lets start writing a simple unit test. If you do it this way, each Ext JS class file\nwill be loaded on demand which makes debugging very easy (compared to having one huge xx-all-debug.js).\nIn your nightly builds, you should consider testing against a built test version of the app for faster test execution.\nYou can build such a version by executing this Cmd statement:</p>\n\n<pre><code>sencha app build testing\n</code></pre>\n\n<h2 id='testing_cmd_application-section-writing-a-basic-unit-test'>Writing a Basic Unit Test</h2>\n\n<p>The Personnel store for the sample application looks like this:</p>\n\n<pre><code>Ext.define('MyApp.store.Personnel', {\n    extend: 'Ext.data.Store',\n\n    alias: 'store.personnel',\n\n    fields: [\n        'name', 'email', 'phone'\n    ],\n\n    data: { items: [\n        { name: 'Jean Luc', email: \"jeanluc.picard@enterprise.com\", phone: \"555-111-1111\" },\n        { name: 'Worf',     email: \"worf.moghsson@enterprise.com\",  phone: \"555-222-2222\" },\n        { name: 'Deanna',   email: \"deanna.troi@enterprise.com\",    phone: \"555-333-3333\" },\n        { name: 'Data',     email: \"mr.data@enterprise.com\",        phone: \"555-444-4444\" }\n    ]},\n\n    proxy: {\n        type: 'memory',\n        reader: {\n            type: 'json',\n            rootProperty: 'items'\n        }\n    }\n});\n</code></pre>\n\n<p>It doesn't contain any logic yet, so let's add a simple <code>getUserByPhoneNumber</code> method:</p>\n\n<pre><code>getUserByPhoneNumber : function(nbr) {\n    // TODO\n}\n</code></pre>\n\n<p>For now, we'll just add a stub and focus on writing the test first. The test for this method will look like this:</p>\n\n<pre><code>describe('My first unit test', function(t) {\n\n    t.ok(MyApp.view.main.Main, 'Found mainview');\n\n    var store;\n\n    t.beforeEach(function(t) {\n        store = new MyApp.store.Personnel({\n            data : [\n                { name: 'Jean Luc', email: \"jeanluc.picard@enterprise.com\", phone: \"555-111-1111\" },\n                { name: 'Worf',     email: \"worf.moghsson@enterprise.com\",  phone: \"555-222-2222\" }\n            ]\n        });\n    });\n\n    t.it('Should support getting a user by phone number lookup', function(t) {\n        t.expect(store.getUserByPhoneNumber('555-111-1111').get('name')).toBe('Jean Luc');\n\n        t.expect(store.getUserByPhoneNumber('foo')).toBe(null);\n    });\n});\n</code></pre>\n\n<p>This test asserts that we can lookup a valid phone number and get a user back, but also verifies that we get <code>null</code>\nwhen providing a non-existing phone number. Running this test confirms that we get failed assertions which is the\nfirst step of TDD. Now we can go ahead and write the simple implementation of the method:</p>\n\n<pre><code>getUserByPhoneNumber : function(nbr) {\n   var index = this.find('phone', nbr);\n\n   if (index &lt; 0) return null;\n\n   return this.getAt(index);\n}\n</code></pre>\n\n<p>After running this in Siesta, you should see a nice screen with all tests green.</p>\n\n<p><img src=\"guides/testing_cmd_application/images/greentests.png\" width=\"600\" /></p>\n\n<p>Let's continue looking at a more advanced type of test - application tests.</p>\n\n<h2 id='testing_cmd_application-section-creating-an-application-smoke-test'>Creating an Application Smoke Test</h2>\n\n<p>For our application tests, we create the following test group in our Harness JS file.</p>\n\n<pre><code>{\n    group           : 'Application Tests',\n    waitForAppReady : true,\n    pageUrl         : '../index.html',\n    items           : [\n        'application-tests/smoketest.t.js'\n    ]\n}\n</code></pre>\n\n<p>We also create a file called \"smoketest.t.js\" in the filesystem and place it in an \"application-tests\" folder.</p>\n\n<pre><code>describe('My first application test', function (t) {\n\n    t.it('Should be possible to open all tabs', function (t) {\n        t.chain(\n            { click : \"&gt;&gt;tab[text=Users]\" },\n\n            { click : \"&gt;&gt;tab[text=Groups]\" },\n\n            { click : \"&gt;&gt;tab[text=Settings]\" },\n\n            { click : \"&gt;&gt;tab[text=Home]\" }\n        );\n    });\n});\n</code></pre>\n\n<p>In this type of test we of course want the application to start normally so we just point the tests to the index.html file.\nThe purpose of our smoke test is just to open each tab and make sure no exceptions are thrown.</p>\n\n<h2 id='testing_cmd_application-section-verifying-presence-of-an-alert-dialog'>Verifying Presence Of an Alert Dialog</h2>\n\n<p>Now let's add one more test file, in which we assert that a popup is shown when clicking on a row in the Personnel grid:</p>\n\n<p><img src=\"guides/testing_cmd_application/images/popup.png\" width=\"600\" /></p>\n\n<pre><code>describe('Personnel grid tests', function (t) {\n\n    t.it('Should show a confirm popup when clicking grid row', function (t) {\n        t.chain(\n            { click : \"mainlist[title=Personnel] =&gt; table.x-grid-item\" },\n\n            // Make sure we see a window with proper title on a row double click\n            { waitForCQVisible : 'window[title=Confirm]' },\n\n            { click : \"&gt;&gt;[itemId=yes]\" }\n        );\n    });\n});\n</code></pre>\n\n<h2 id='testing_cmd_application-section-conclusion'>Conclusion</h2>\n\n<p>Testing applications generated with Sencha Cmd is just as easy as testing any other code base. We recommend that you\nstart with unit testing your core files such as stores, model and logic classes. Once you have good coverage there,\nthen also invest in a few application tests covering your most common user scenarios. If you've encountered any\nissues or problems with your Sencha testing, please let us know and we'll try to help you.</p>\n\n<h2 id='testing_cmd_application-section-buy-this-product'>Buy this product</h2>\n\n<p>Visit our store: <a href=\"http://bryntum.com/store/siesta\">http://bryntum.com/store/siesta</a></p>\n\n<h2 id='testing_cmd_application-section-support'>Support</h2>\n\n<p>Ask a question in our community forum: <a href=\"http://www.bryntum.com/forum/viewforum.php?f=20\">http://www.bryntum.com/forum/viewforum.php?f=20</a></p>\n\n<p>Share your experience in our IRC channel: <a href=\"http://webchat.freenode.net/?randomnick=1&amp;channels=bryntum&amp;prompt=1\">#bryntum</a></p>\n\n<p>Please report any bugs through the web interface at <a href=\"https://www.assembla.com/spaces/bryntum/support/tickets\">https://www.assembla.com/spaces/bryntum/support/tickets</a></p>\n\n<h2 id='testing_cmd_application-section-see-also'>See also</h2>\n\n<p>Web page of this product: <a href=\"http://bryntum.com/products/siesta\">http://bryntum.com/products/siesta</a></p>\n\n<p>Other Bryntum products: <a href=\"http://bryntum.com/products\">http://bryntum.com/products</a></p>\n\n<h2 id='testing_cmd_application-section-attribution'>Attribution</h2>\n\n<p>This software contains icons from the following icon packs (licensed under Creative Common 2.5/3.0 Attribution licenses)</p>\n\n<ul>\n<li><a href=\"http://www.famfamfam.com/lab/icons/silk/\">http://www.famfamfam.com/lab/icons/silk/</a></li>\n<li><a href=\"http://led24.de/iconset/\">http://led24.de/iconset/</a></li>\n<li><a href=\"http://p.yusukekamiyamane.com/\">http://p.yusukekamiyamane.com/</a></li>\n<li><a href=\"http://rrze-icon-set.berlios.de/index.html\">http://rrze-icon-set.berlios.de/index.html</a></li>\n<li><a href=\"http://www.smashingmagazine.com/2009/05/20/flavour-extended-the-ultimate-icon-set-for-web-designers/\">http://www.smashingmagazine.com/2009/05/20/flavour-extended-the-ultimate-icon-set-for-web-designers/</a></li>\n<li><a href=\"http://www.doublejdesign.co.uk/products-page/icons/super-mono-icons/\">http://www.doublejdesign.co.uk/products-page/icons/super-mono-icons/</a></li>\n<li><a href=\"http://pixel-mixer.com/\">http://pixel-mixer.com/</a></li>\n</ul>\n\n\n<p>Thanks a lot to the authors of the respective icons packs.</p>\n\n<h2 id='testing_cmd_application-section-copyright-and-license'>COPYRIGHT AND LICENSE</h2>\n\n<p>Copyright (c) 2009-2016, Bryntum &amp; Nickolay Platonov</p>\n\n<p>All rights reserved.</p>\n","title":"Testing applications generated by Sencha Cmd"});