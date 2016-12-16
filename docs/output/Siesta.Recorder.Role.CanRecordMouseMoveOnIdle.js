Ext.data.JsonP.Siesta_Recorder_Role_CanRecordMouseMoveOnIdle({"tagname":"class","name":"Siesta.Recorder.Role.CanRecordMouseMoveOnIdle","autodetected":{},"files":[{"filename":"CanRecordMouseMoveOnIdle.js","href":"CanRecordMouseMoveOnIdle.html#Siesta-Recorder-Role-CanRecordMouseMoveOnIdle"}],"members":[{"name":"idleTimeout","tagname":"cfg","owner":"Siesta.Recorder.Role.CanRecordMouseMoveOnIdle","id":"cfg-idleTimeout","meta":{}},{"name":"recordMouseMoveOnIdle","tagname":"cfg","owner":"Siesta.Recorder.Role.CanRecordMouseMoveOnIdle","id":"cfg-recordMouseMoveOnIdle","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-Siesta.Recorder.Role.CanRecordMouseMoveOnIdle","short_doc":"A mixin, providing the feature of recording the \"moveCursorTo\" action, when mouse is idle\nat some point for idleTimeo...","component":false,"superclasses":[],"subclasses":[],"mixedInto":["Siesta.Recorder.Recorder"],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Mixed into</h4><div class='dependency'><a href='#!/api/Siesta.Recorder.Recorder' rel='Siesta.Recorder.Recorder' class='docClass'>Siesta.Recorder.Recorder</a></div><h4>Files</h4><div class='dependency'><a href='source/CanRecordMouseMoveOnIdle.html#Siesta-Recorder-Role-CanRecordMouseMoveOnIdle' target='_blank'>CanRecordMouseMoveOnIdle.js</a></div></pre><div class='doc-contents'><p>A mixin, providing the feature of recording the \"moveCursorTo\" action, when mouse is idle\nat some point for <a href=\"#!/api/Siesta.Recorder.Role.CanRecordMouseMoveOnIdle-cfg-idleTimeout\" rel=\"Siesta.Recorder.Role.CanRecordMouseMoveOnIdle-cfg-idleTimeout\" class=\"docClass\">idleTimeout</a> time.</p>\n\n<p>This feature can be enabled/disabled with the recordMouseMoveOnIdle config option.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-cfg'>Config options</h3><div class='subsection'><div id='cfg-idleTimeout' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Siesta.Recorder.Role.CanRecordMouseMoveOnIdle'>Siesta.Recorder.Role.CanRecordMouseMoveOnIdle</span><br/><a href='source/CanRecordMouseMoveOnIdle.html#Siesta-Recorder-Role-CanRecordMouseMoveOnIdle-cfg-idleTimeout' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Siesta.Recorder.Role.CanRecordMouseMoveOnIdle-cfg-idleTimeout' class='name expandable'>idleTimeout</a> : Boolean<span class=\"signature\"></span></div><div class='description'><div class='short'>The amount of time for mouse cursor to be idle, after which the\nmoveCursorTo action will be recorded with the target ...</div><div class='long'><p>The amount of time for mouse cursor to be idle, after which the\n<code>moveCursorTo</code> action will be recorded with the target of current cursor position.</p>\n<p>Defaults to: <code>3000</code></p></div></div></div><div id='cfg-recordMouseMoveOnIdle' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Siesta.Recorder.Role.CanRecordMouseMoveOnIdle'>Siesta.Recorder.Role.CanRecordMouseMoveOnIdle</span><br/><a href='source/CanRecordMouseMoveOnIdle.html#Siesta-Recorder-Role-CanRecordMouseMoveOnIdle-cfg-recordMouseMoveOnIdle' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Siesta.Recorder.Role.CanRecordMouseMoveOnIdle-cfg-recordMouseMoveOnIdle' class='name expandable'>recordMouseMoveOnIdle</a> : Boolean<span class=\"signature\"></span></div><div class='description'><div class='short'>Set this option to true to enable recording of moveCursorTo\naction, when mouse is idle at some point for certain amou...</div><div class='long'><p>Set this option to <code>true</code> to enable recording of <code>moveCursorTo</code>\naction, when mouse is idle at some point for certain amount of time (<a href=\"#!/api/Siesta.Recorder.Role.CanRecordMouseMoveOnIdle-cfg-idleTimeout\" rel=\"Siesta.Recorder.Role.CanRecordMouseMoveOnIdle-cfg-idleTimeout\" class=\"docClass\">idleTimeout</a>)</p>\n<p>Defaults to: <code>true</code></p></div></div></div></div></div></div></div>","meta":{}});