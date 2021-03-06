/*

Siesta 4.2.2
Copyright(c) 2009-2016 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**

@class Siesta.Test.ExtJSCore

A base mixin for testing Ext JS and Sencha Touch applications.

Contains testing functionality that is common for both frameworks.

This file is a reference only, for a getting start guide and manual, please refer to <a href="#!/guide/siesta_getting_started">Getting Started Guide</a>.

*/
Role('Siesta.Test.ExtJSCore', {
    
    does    : Siesta.Util.Role.CanInstallCQRootPseudo,

    has : {
        waitForExtReady         : true,
        waitForAppReady         : false,

        waitForExtComponentQueryReady   : true,

        loaderPath              : null,
        requires                : null,

        simulateEventsWith      : {
            is      : 'rw',
            lazy    : function () {
                var isIE9           = navigator.userAgent.match(/MSIE 9.0;/)
                var Ext             = this.getExt()

                // no Ext or Ext3 should use standard "dispatchEvent" method
                if (!Ext || !Ext.getVersion) return 'dispatchEvent'

                var extVersion      = Ext.getVersion('extjs')

                // the "Ext.getVersion('extjs')" is just "true" in Ext3? (when testing SA)
                var isBelowExt421   = Boolean((extVersion && extVersion.isLessThan && extVersion.isLessThan('4.2.1.883')))

                var div             = document.createElement('div')

                return div.attachEvent && (isIE9 || isBelowExt421) ? 'fireEvent' : 'dispatchEvent'
            }
        },

        eventMap                : {
            is              : 'rw',
            lazy            : function () {
                var Ext             = this.getExt()

                if (!Ext || !Ext.dom || !Ext.dom.Element || !Ext.dom.Element.prototype.eventMap) return null

                // need to create copy! to not store the value from another context on a test instance
                return Joose.O.copy(Ext.dom.Element.prototype.eventMap)
            }
        },

        isExtOnReadyDone        : false,
        onReadyWaitingStarted   : false,
        isAppReadyDone          : false,
        
        loaderWaitingStarted    : false,
        requiringWaitingStarted : false,
        isRequiringDone         : false,

        modelsDefinedInPreload  : Joose.I.Object
    },

    override : {

        onTestStart : function () {
            var me                  = this
            var sharedSandboxState  = this.sharedSandboxState

            if (!this.reusingSandbox && sharedSandboxState) {
                if (!sharedSandboxState.modelsDefinedInPreload) sharedSandboxState.modelsDefinedInPreload = {}

                this.forEachModelInAllSchemas(function (entity, entityName, className, schema) {
                    sharedSandboxState.modelsDefinedInPreload[ className ] = true
                })
            }
        },


        // only called for the re-used contexts
        cleanupContextBeforeStartDom : function () {
            var Ext         = this.getExt()

            if (!Ext) return this.SUPER()

            var me          = this

            // if component query is present - try to unregister all components
            if (Ext.ComponentQuery) {
                var keep        = {}
                var msgBox      = Ext.MessageBox

                if (msgBox) {
                    keep[ msgBox.id ] = true
                }

                // retrieve the top-level components
                var comps       = Ext.ComponentQuery.query('{ownerCt == null}')

                // sort, so that containers goes first
                // the logic is, that containers have "more logic" and may affect components
                // use case - grid editing is active and the editor field is destroyed before the grid -
                // that throws exception in gantt code

                comps.sort(function (a, b) {
                    a   = (a instanceof Ext.Container) ? 0 : 1
                    b   = (b instanceof Ext.Container) ? 0 : 1

                    return a - b
                })

                Joose.A.each(comps, function (comp) {
                    if (!keep[ comp.id ] && !comp.isDestroyed) comp.destroy()
                })
            }

            // if there's a class manager - unregister "unexpected" classes
            if (Ext.ClassManager && Ext.undefine) {
                var index       = {}

                Joose.O.each(Ext.ClassManager.classes, function (cls, name) {
                    var global      = name.split('.')[ 0 ]

                    if (!me.isGlobalExpected(global, index)) Ext.undefine(name)
                })
            }

            // if there's a store manager - also unregister stores (all stores except internal ext js store(s))
            if (Ext.data && Ext.data.StoreManager) {
                var toRemove = [];

                Ext.data.StoreManager.each(function(store) {
                    if (store.storeId !== "ext-empty-store") toRemove.push(store);
                });

                Ext.data.StoreManager.unregister.apply(Ext.data.StoreManager, toRemove);
            }

            var sharedSandboxState          = this.sharedSandboxState
            var modelsDefinedInPreload      = sharedSandboxState && sharedSandboxState.modelsDefinedInPreload

            me.forEachModelInAllSchemas(function (entity, entityName, className, schema) {
                if (!modelsDefinedInPreload[ className ]) {
                    Ext.undefine(className)

                    // TODO also need to remove the associations
                    delete schema.entityClasses[ className ]
                    delete schema.entities[ entityName ]
                }
            })
            
            Ext.resumeLayouts && Ext.resumeLayouts()
        },


        processMouseEventName : function (eventName) {
            var eventMap        = this.getEventMap()

            return eventMap && eventMap[ eventName ] || eventName;
        },


        processSubTestConfig : function (config) {
            var res                 = this.SUPER(config)

            // sub tests should not wait for Ext.onReady or for application launch
            res.waitForAppReady     = false
            res.waitForExtReady     = false

            return res
        },


        isReady : function() {
            var result      = this.SUPERARG(arguments);

            if (!result.ready) return result;

            var me          = this
            var Ext         = this.getExt();
            var R           = Siesta.Resource('Siesta.Test.ExtJSCore');
            
            var loaderPath  = this.loaderPath
            var StartTest   = this.global.StartTest
            
            if (loaderPath && Ext && Ext.Loader && !StartTest.loaderPathHookInstalled) {
                this.harness.generateLoaderPathHook()(StartTest, Ext, loaderPath)
            }

            var requires    = this.requires

            if (requires && !this.requiringWaitingStarted && Ext && Ext.require) {
                this.requiringWaitingStarted    = true
                
                Ext.require(requires, function () {
                    me.isRequiringDone      = true
                })
            }

            // in microloaded apps, Ext.onReady may appear with some arbitrary delay
            if (this.waitForExtReady && !this.onReadyWaitingStarted && Ext && Ext.onReady) {
                this.onReadyWaitingStarted  = true

                Ext.onReady(function () {
                    me.isExtOnReadyDone     = true
                })
            }
            
            // Sencha Touch has a weird intermediate state, where Ext object is already on the page, but it misses
            // almost every property people are used to, like "ComponentQuery", "onReady" etc
            // detecting such state with "Ext.blink" property
            if (
                this.waitForExtComponentQueryReady 
                && Ext
                // this indicates Ext>=4, Ext3 does not have "ComponentQuery" concept 
                && (Ext.getVersion || Ext.blink || Ext.manifest || Ext.microloaded) 
                && !Ext.ComponentQuery
            ) return {
                ready       : false,
                reason      : R.get('waitedForComponentQuery')
            }

            if (requires && !this.isRequiringDone) return {
                ready       : false,
                reason      : R.get('waitedForRequires')
            }

            if (this.waitForExtReady && this.onReadyWaitingStarted && !this.isExtOnReadyDone) return {
                ready       : false,
                reason      : R.get('waitedForExt')
            }

            if (this.waitForAppReady && !this.isAppReadyDone && Ext) {
                var name            = Ext.manifest.name
                
                var isAppReadyDone  = false
                
                try {
                    isAppReadyDone  = me.global[ name ].getApplication().launched
                } catch (e) {
                }
                
                if (isAppReadyDone) 
                    this.isAppReadyDone = isAppReadyDone
                else
                    return {
                        ready       : false,
                        reason      : R.get('waitedForApp')
                    }
            }

            if (Ext && Ext.ComponentQuery) {
                // add :root pseudo CQ selector to be able to identify 'root' level components that don't have
                // parent containers. value is 1-based
                this.installRootPseudoCQ(Ext)
            }

            return {
                ready       : true
            }
        },

        // Overridden to deal with the different event firing mechanisms in Ext JS 3 vs 4
        // This code is required because in IE events are simulated using fireEvent instead of dispatchEvent and it seems fireEvent will
        // will not update a checkbox 'checked' state properly so we're forcing the toggle to solve this situation.
        // This issue is only relevant in IE + Ext.
        //
        // Test case: 507_form_checkbox.t.js
        simulateMouseClick: function (clickInfo, callback, scope, options) {
            var me      = this
            var el      = clickInfo.el
            var Ext     = this.getExt()

            var isExt5  = Ext && Ext.getVersion && Ext.getVersion('extjs') && Ext.getVersion('extjs').major == 5

            // Force check toggle for input checkboxes
            if (
                (this.getSimulateEventsWith() === 'fireEvent' || isExt5)
                    &&
                (el.type === 'checkbox' || el.type === 'radio') && !el.disabled && !el.readOnly
            ) {
                var oldState = el.checked;

                var optionsWithBubble       = Joose.O.copy(options)
                optionsWithBubble.bubbles   = true

                if (callback) {
                    this.SUPER(clickInfo, function () {
                        if (el.checked === oldState) {
                            el.checked = !oldState;

                            me.simulateEvent(el, 'change', optionsWithBubble)
                        }
                        callback.call(scope || this);
                    });
                } else {
                    this.SUPERARG(arguments);

                    if (el.checked === oldState) {
                        el.checked = !oldState;

                        me.simulateEvent(el, 'change', optionsWithBubble)
                    }
                }
            } else {
                this.SUPERARG(arguments);
            }
        }
    },

    methods : {

        initialize : function() {
            // Since this test is preloading Ext JS, we should let Siesta know what to 'expect'
            this.expectGlobals('Ext', 'id');
            this.SUPER();
        },


        forEachModelInAllSchemas : function (func) {
            var Ext     = this.getExt()

            if (Ext && Ext.data && Ext.data.schema && Ext.data.schema.Schema && Ext.undefine) {
                Joose.O.each(Ext.data.schema.Schema.instances, function (schema, name) {

                    schema.eachEntity(function (entityName) {
                        var entity  = schema.getEntity(entityName)

                        func(entity, entityName, entity.$className, schema)
                    })
                })
            }
        },


        doStart : function () {
            var me      = this;
            var Ext     = this.getExt();

            if (!Ext) {
                // proceed to parent implementation disabling our "can start" checkers
                this.waitForAppReady    = false
                this.waitForExtReady    = false
                this.requires           = null

                this.SUPERARG(arguments)

                return
            }

            // PROBABLY NOT NEEDED AS OF EXT5
            // this flag will explain to Ext, that DOM ready event has already happened
            // Ext fails to set this flag if it was loaded dynamically, already after DOM ready
            // the test will start only after DOM ready anyway, so we just set this flag
            Ext.isReady         = true
            
            if (!Ext.manifest || !Ext.manifest.name) this.waitForAppReady = false

            this.SUPERARG(arguments)
        },

        /**
         * This method returns the `Ext` object from the scope of the test. When creating your own assertions for Ext JS code, you need
         * to make sure you are using this method to get the `Ext` instance. Otherwise, you'll be using the same "top-level" `Ext`
         * instance, used by the harness for its UI.
         *
         * For example:
         *
         *      elementHasProvidedCssClass : function (el, cls, desc) {
         *          var Ext     = this.getExt();
         *
         *          if (Ext.fly(el).hasCls(cls)) {
         *              this.pass(desc);
         *          } else {
         *              this.fail(desc);
         *          }
         *      }
         *
         * @return {Object} The `Ext` object from the scope of test
         */
        getExt : function () {
            return this.global.Ext
        },


        /**
         * The alias for {@link #getExt}
         * @method
         */
        Ext : function () {
            return this.global.Ext
        },


        isExtJSComponentQueryTarget : function (obj) {
            var Ext     = this.getExt()

            return Boolean(obj && Ext && (Ext.Component && obj instanceof Ext.Component || obj.isWidget))
        },
        
        
        /**
         * This method performs an ExtJS component query. The selector may start with `>>` which will be
         * trimmed.
         * 
         * @param {String} selector A component query selector. The leading '>>' will be trimmed.
         * @param {Ext.Component} root A root for the component query.
         * @param {Object} options
         * @param {Boolean} options.ignoreNonVisible Whether to remove the hidden components from the results 
         * 
         * @return {Array[Ext.Component]} Array of matching components 
         */
        componentQuery : function (selector, root, options) {
            options     = options || {}
            var Ext     = this.Ext()
            
            if (!selector || !Ext.ComponentQuery) return []
            
            // strip out leading >>  which is used as indicator of the ComponentQuery in ActionTarget string
            selector    = this.trimString(selector.replace(/^(\s*>>)?/, ''))

            var result  = Ext.ComponentQuery.query(selector, root);

            if (options.ignoreNonVisible) {
                var me              = this
                var onlyVisible     = []
                
                Joose.A.each(result, function (cmp) {
                    // Sencha Touch components have no "isVisible()" method
                    // we use `componentIsHidden` here which peforms just the "hierarchical" check (does not use "elementIsTop")
                    if (!me.componentIsHidden(cmp)) onlyVisible.push(cmp)
                });

                result              = onlyVisible
            }
            
            return result
        },
        

        // Accepts Ext.Component or ComponentQuery
        normalizeComponent : function (component, allowEmpty, options) {
            options         = options || {}
            var Ext         = this.Ext()
            var me          = this

            var matchingMultiple    = false

            if (this.typeOf(component) === 'String') {
                var result  = this.componentQuery(component, null, { ignoreNonVisible : options.ignoreNonVisible })
                
                var R       = Siesta.Resource('Siesta.Test.ExtJSCore');

                if (!allowEmpty && result.length < 1)   this.warn(R.get('noComponentMatch').replace('{component}', component));

                if (result.length > 1)   {
                    matchingMultiple    = true

                    var text        = R.get('multipleComponentMatch').replace('{component}', component);

                    if (this.harness.failOnMultipleComponentMatches) {
                        this.fail(text);
                    } else {
                        this.warn(text);
                    }
                }

                component = result[ 0 ];
            }

            return options.detailed ? { comp : component, matchingMultiple : matchingMultiple } : component
        },

        /**
         * @private
         *
         * @param {Ext.Component} comp the Ext.Component
         * @param {Boolean} locateInputEl For form fields, try to find the inner input element by default.
         * If you want to target the containing Component element, pass false instead.
         *
         * @return {Ext.dom.Element}
         */
        compToEl : function (comp, locateInputEl) {
            if (!comp) return null

            var Ext         = this.Ext();
            locateInputEl   = locateInputEl !== false;

            // Handle editors, deal with the field directly
            if (Ext.Editor && comp instanceof Ext.Editor && comp.field) {
                comp        = comp.field;
            }

            // Ext JS
            if (Ext && Ext.form && Ext.form.Field && locateInputEl) {
                // Deal with bizarre markup in Ext 5.1.2+
                if (
                    (Ext.form.Checkbox && comp instanceof Ext.form.Checkbox || Ext.form.Radio && comp instanceof Ext.form.Radio)
                    && comp.el
                ) {
                    var displayEl   = comp.displayEl;

                    if (displayEl && comp.boxLabel) {
                        return displayEl;
                    }
                    //                                                    Ext6 Modern
                    return comp.el.down('.x-form-field') || comp.el.down('.x-field-input') || comp.inputEl;
                }

                if (comp instanceof Ext.form.Field && comp.inputEl) {
                    var field       = comp.el.down('.x-form-field');

                    return (field && field.dom) ? field : comp.inputEl;
                }

                if (Ext.form.HtmlEditor && comp instanceof Ext.form.HtmlEditor) {
                    //     Ext JS 3       Ext JS 4
                    return comp.iframe || comp.inputEl;
                }
            }

            // Sencha Touch: Form fields can have a child input component
            if (Ext && Ext.field && Ext.field.Field && comp instanceof Ext.field.Field && locateInputEl) {
                comp        = comp.getComponent();

                // some of the SenchaTouch fields uses "masks" - another DOM element, which is applied
                // on top of the field when it does not have focus
                // some of them have mask always ("useMask === true"), for such fields return mask element
                // as its the primary point of user interaction
                if (comp.getUseMask && comp.getUseMask() === true) return comp.mask
            }

            //                      Ext JS   vs                    Sencha Touch
            return comp.getEl ? comp.getEl() : locateInputEl && comp.input || comp.el || comp.element;
        },

        // Accept Ext.Element and Ext.Component
        // If the 'shallow' flag is true we should not 'reevaluate' the target element - stop at the component element.
        normalizeElement : function(el, allowMissing, shallow, detailed, options) {
            if (!el)         return null

            if (el.nodeName) return el;

            var matchingMultiple = false
            var query
            var Ext     = this.getExt();
            var origEl  = el;
            var scopeAdjusted;

            //var offset                      = options && options.offset
            var stopAtComponentLevel        = options && options.stopAtComponentLevel
            var ignoreNonVisible            = options && options.hasOwnProperty('ignoreNonVisible') ? options.ignoreNonVisible : true

            if (typeof el === 'string') {
                var mainParts  = el.split('->');

                if (mainParts.length === 2) {
                    scopeAdjusted = this.adjustScope(el);

                    el = this.trimString(mainParts[ 1 ]);

                    // Frame might not yet exist, or be ready
                    if (!scopeAdjusted ||
                        ((el.match(/^\s*>>/) || el.match(/=>/)) && !this.Ext())) {
                        this.resetScope();
                        return null;
                    }
                }

                if (el.match(/=>/)) {
                    // Composite query
                    query               = this.compositeQuery(el, null, allowMissing, ignoreNonVisible)
                    el                  = query[ 0 ]
                    matchingMultiple    = query.length > 1
                } else if (el.match(/^\s*>>/)) {
                    var compRes         = this.normalizeComponent(el, allowMissing, { ignoreNonVisible : ignoreNonVisible, detailed : true })

                    el                  = compRes.comp
                    matchingMultiple    = compRes.matchingMultiple
                } else {
                    // string in unknown format, guessing it's a DOM query
                    var retVal          = this.SUPER(el, allowMissing, shallow, detailed);

                    if (scopeAdjusted) this.resetScope();

                    return retVal;
                }

                if (!allowMissing && !el) {
                    var R               = Siesta.Resource('Siesta.Test.ExtJSCore');
                    var warning         = R.get('noComponentFound') + ': ' + origEl;

                    this.warn(warning);
                    if (scopeAdjusted) this.resetScope();
                    throw warning;
                }
            }

            var rawResult       = false

            if (this.isExtJSComponentQueryTarget(el))
                if (stopAtComponentLevel)
                    rawResult   = true
                else {
                    el          = this.compToEl(el);
                }

            // ExtJS Element
            if (el && el.dom)
                if (stopAtComponentLevel)
                    rawResult   = true
                else
                    el          = el.dom

            // will also handle the case of conversion of array with coordinates to el
            var res             = rawResult ? el : this.SUPER(el, allowMissing, shallow);

            if (scopeAdjusted) this.resetScope();

            return detailed ? { el : res, matchingMultiple : matchingMultiple } : res
        },


        // this method generally has the same semantic as the "normalizeElement", but resolved
        // till the component level only.. Which we prefer for the "firesOk" assertions family. 
        // It's also being used in Siesta.Test.Action.Role.HasTarget to determine what to pass to the next step
        // from the previous step, which has been specified with the Siesta.Test.ActionTarget descriptor
        //
        // on the browser level the only possibility is DOM element
        // but on ExtJS level user can also use ComponentQuery and next step need to receive the
        // component instance
        normalizeActionTarget : function (el, allowMissing, ignoreNonVisible) {
            return this.normalizeElement(
                el, 
                allowMissing, 
                false, // shallow
                false, // detailed
                { ignoreNonVisible : ignoreNonVisible !== false, stopAtComponentLevel : true } // options
            );
        },

         /**
         * This method allow assertions to fail silently for tests executed in versions of Ext JS up to a certain release. When you try to run this test on a newer
         * version of Ext JS and it fails, it will fail properly and force you to re-investigate. If it passes in the newer version, you should remove the
         * use of this method.
         *
         * See also {@link Siesta.Test#todo}
         *
         * @param {String} frameworkVersion The Ext JS framework version, e.g. '4.0.7'
         * @param {Function} fn The method covering the broken functionality
         * @param {String} reason The reason or explanation of the bug
        */
        knownBugIn : function(frameworkVersion, fn, reason) {
            var Ext     = this.getExt();
            var version = Ext.versions.extjs || Ext.versions.touch;
            var R       = Siesta.Resource('Siesta.Test.ExtJSCore');

            if (this.harness.failKnownBugIn || version.isGreaterThan(frameworkVersion)) {
                fn.call(this.global, this);
            } else {
                this.todo(R.get('knownBugIn') + ' ' + frameworkVersion + ': ' + (reason || ''), fn);
            }
        },


         /**
         * This method will load the specified classes with `Ext.require()` and call the provided callback. Additionally it will check that all classes have been loaded.
         *
         * This method accepts either variable number of arguments:
         *
         *      t.requireOk('Some.Class1', 'Some.Class2', function () { ... })
         * or array of class names:
         *
         *      t.requireOk([ 'Some.Class1', 'Some.Class2' ], function () { ... })
         *
         * @param {String} className1 The name of the class to `require`
         * @param {String} className2 The name of the class to `require`
         * @param {String} classNameN The name of the class to `require`
         * @param {Function} fn The callback. Will be called even if the loading of some classes have failed.
        */
        requireOk : function () {
            var me                  = this
            var global              = this.global
            var Ext                 = this.getExt()
            var args                = Array.prototype.concat.apply([], arguments)
            var R                   = Siesta.Resource('Siesta.Test.ExtJSCore');

            var callback

            if (this.typeOf(args[ args.length - 1 ]) == 'Function') callback = args.pop()


            // what to do when loading completed or timed-out
            var continuation    = function () {
                me.endAsync(async)

                Joose.A.each(args, function (className) {
                    var clsManager  = Ext.ClassManager
                    var cls         = clsManager.get(className)

                    /**
                     * Checks if the class being required is an override, which is not available
                     * via Ext.ClassManager.get(). Only available in ExtJS 5+.
                     *
                     * See: https://www.assembla.com/spaces/bryntum/tickets/2201
                     */
                    var isOverride  = clsManager.overrideMap && clsManager.overrideMap[ className ]

                    //   override               normal class                         singleton
                    if (isOverride || cls && (me.typeOf(cls) == 'Function' || me.typeOf(cls.self) == 'Function'))
                        me.pass(R.get('Class') + ": " + className + " " + R.get('wasLoaded'))
                    else
                        me.fail(R.get('Class') + ": " + className + " " + R.get('wasNotLoaded'))
                })

                me.processCallbackFromTest(callback)
            }

            var timeout         = this.defaultTimeout,
                async           = this.beginAsync(timeout + 100)

            var hasTimedOut             = false
            var originalSetTimeout      = this.originalSetTimeout
            var originalClearTimeout    = this.originalClearTimeout

            var timeoutId       = originalSetTimeout(function () {
                hasTimedOut     = true
                continuation()
            }, timeout)

            Ext.Loader.setConfig({ enabled : true });

            Ext.require(args, function () {
                originalClearTimeout(timeoutId)

                if (!hasTimedOut) continuation()
            })
        },

        /**
         * This method is a simple wrapper around the {@link #chainClick} - it performs a component query for provided `selector` starting from the `root` container
         * and then clicks on all found components, in order:
         *

    // click all buttons in the `panel`
    t.clickComponentQuery('button', panel, function () {})

         *
         * The 2nd argument for this method can be omitted and method can be called with 2 arguments only. In this case a global component query will be performed:
         *

    // click all buttons in the application
    t.clickComponentQuery('button', function () {})

         *
         * @param {String} selector The selector to perform a component query with
         * @param {Ext.Container} root The optional root container to start a query from.
         * @param {Function} callback The callback to call, after clicking all the found components
         */
        clickComponentQuery : function (selector, root, callback) {

            if (arguments.length == 2 && this.typeOf(arguments[ 1 ]) == 'Function') {
                callback    = root
                root        = this.Ext().ComponentQuery
            }

            if (arguments.length == 1) {
                root        = this.Ext().ComponentQuery
            }

            var result      = root.query(selector)

            this.chainClick(result, function () { callback && callback.call(this, result) })
        },


        /**
         * An alias for {@link #clickComponentQuery}.
         *
         * @param {String} selector The selector to perform a component query with
         * @param {Ext.Container} root The optional root container to start a query from.
         * @param {Function} callback The callback to call, after clicking all the found components
         */
        clickCQ : function () {
            this.clickComponentQuery.apply(this, arguments)
        },

        /**
         * This method performs a combination of `Ext.ComponentQuery` and DOM query, allowing to easily find the DOM elements,
         * matching a css selector, inside of some Ext.Component.
         *
         * Both queries should be combined with the `=>` separator:
         *
         *      gridpanel[title=Accounts] => .x-grid-row
         *
         * On the left side of such "composite" query should be a component query, on the right - DOM query (CSS selector)
         *
         * In case when component query returns more than one component, this method iterate through all of them and will try to
         * resolve the 2nd part of the query. The results from the 1st component with matching DOM nodes is returned.
         *
         * E.g. the composite query `gridpanel[title=Accounts] => .x-grid-row` will give you the grid row elements inside a grid panel
         * with `title` config matching "Accounts".
         *
         * @param {String} selector The CompositeQuery selector
         * @param {Ext.Component} root The optional root component to start the component query from. If omitted, a global component query will be performed.
         * @param {Boolean} allowEmpty False to throw the exception from this method if no matching DOM element is found. Default is `true`.
         *
         * @return {HTMLElement[]} The array of DOM elements
         */
        compositeQuery : function (selector, root, allowEmpty, onlyVisibleComponents) {
            allowEmpty          = allowEmpty !== false

            var Ext             = this.Ext();
            var R               = Siesta.Resource('Siesta.Test.ExtJSCore')
            var i

            // Try to find magic => selector for nested ComponentQuery and CSS selector
            var mainParts       = selector.split('=>');

            root                = root || Ext && Ext.ComponentQuery;

            // Root might not exist, Ext could be loaded in bootstrap mode without CQ
            if (!root) return []

            if (mainParts.length < 2) throw R.get('invalidCompositeQuery') + ': ' + selector

            var compQuery       = mainParts[ 0 ]
            var domQuery        = mainParts[ 1 ]

            var components

            if (compQuery.match(/\.\w+\(/)) {
                var match
                var re          = /(.+?)\.(\w+)\(\)/g

                // complex case like: xtype1 xtype2.getPicker() xtype3 xtype4.someMethod()
                while (root && (match = re.exec(compQuery)) != null) {
                    // TODO assuming query is specific, targeting just one target
                    root        = root.query(match[ 1 ])[ 0 ]

                    if (root && match[ 2 ]) root = root[ match[ 2 ] ]()
                }

                if (!root && !allowEmpty) throw R.get('invalidCompositeQuery') + ': ' + selector

                components     = [ root ]
            } else {
                components     = root.query(compQuery)
            }

            if (!components.length)
                if (allowEmpty)
                    return []
                else
                    throw R.get('ComponentQuery') + ' ' + compQuery + ' ' + R.get('matchedNoCmp');

            for (i = 0; i < components.length; i++) {
                var cmp             = components[i];

                if (
                    cmp.rendered && (            // Widgets don't implement isVisible/isHidden
                        !onlyVisibleComponents || cmp.isWidget || (cmp.isVisible ? cmp.isVisible() : !cmp.isHidden())
                    )
                ) {
                    var result  = this.compToEl(cmp, false);
                    result      = this.sizzle(domQuery, result.dom)

                    if (result.length > 0) {
                        return result;
                    }
                }
            }

            if (allowEmpty) {
                return [];
            }
            throw R.get('CompositeQuery') + ' ' + selector + ' matched no DOM elements';
        },

        /**
         * An alias for Ext.ComponentQuery.query.
         *
         * As a convenience, this method will strip leading `>>` characters from the query
         * (which denotes the component query in {@link Siesta.Test.ActionTarget}).
         *
         * @param {String} selector The selector to perform a component query with
         */
        cq : function (selector) {
            return this.Ext().ComponentQuery.query(selector.replace(/^(\s*>>)?/, ''));
        },

        /**
         * An shorthand method to get the first result of any Ext.ComponentQuery.query
         *
         * As a convenience, this method will strip leading `>>` characters from the query
         * (which denotes the component query in {@link Siesta.Test.ActionTarget}).
         *
         * @param {String} selector The selector to perform a component query with
         */
        cq1 : function (selector) {
            return this.Ext().ComponentQuery.query(selector.replace(/^(\s*>>)?/, ''))[ 0 ];
        },

        /**
         * Waits until the passed action target is detected and no ongoing animations are found. This can be a string such as a component query, CSS query or a composite query.
         *
         * @param {String/Siesta.Test.ActionTarget} target The target presence to wait for
         * @param {Function} callback The callback to call after the target has been found
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value.
         */
        waitForTarget : function(target, callback, scope, timeout, offset) {
            var SUPER   = this.SUPER

            this.waitForAnimations(function () {
                SUPER.call(this, target, callback, scope, timeout, offset)
            }, this, timeout);
        },

        /**
         * This assertion passes if the singleton MessageBox instance is currently visible.
         * The assertion is relevant if you use one of the following methods Ext.Msg.alert, Ext.Msg.confirm, Ext.Msg.prompt.
         *
         * @param {String} [description] The description for the assertion
         */
        messageBoxIsVisible : function(desc) {
            return this.notOk(this.Ext().Msg.isHidden(), desc || Siesta.Resource('Siesta.Test.ExtJSCore', 'messageBoxVisible'));
        },

        /**
         * This assertion passes if the singleton MessageBox instance is currently hidden.
         * The assertion is relevant if you use one of the following methods Ext.Msg.alert, Ext.Msg.confirm, Ext.Msg.prompt.
         *
         * @param {String} [description] The description for the assertion
         */
        messageBoxIsHidden : function(desc) {
            return this.ok(this.Ext().Msg.isHidden(), desc || Siesta.Resource('Siesta.Test.ExtJSCore', 'messageBoxHidden'));
        },

        /**
         * This assertion passes if the passed component query matches at least one component.
         *
         * @param {String} query The component query
         * @param {String} [description] The description for the assertion
         */
        cqExists : function(query, description) {
            this.ok(this.cq1(query), description);
        },

        /**
         * This assertion passes if the passed component query matches no components.
         *
         * @param {String} query The component query
         * @param {String} [description] The description for the assertion
         */
        cqNotExists : function(query, description) {
            this.notOk(this.cq1(query), description);
        },

        /**
         * This assertion passes if the passed component query matches at least one component.
         *
         * @param {String} query The component query
         * @param {String} [description] The description for the assertion
         */
        componentQueryExists : function() {
            this.cqExists.apply(this, arguments);
        },

        /**
         * Sets a value to an Ext Component. A faster way to set a value than manually calling "type" into
         * a text field for example. A value is set by calling either the `setRawValue` or `setValue` method
         * of the component.
         *
         * @param {Ext.Component/String} component A component instance or a component query to resolve
         * @param {Mixed} value
         */
        setValue : function (component, value, callback, scope) {
            component = this.normalizeComponent(component);

            (component.setChecked || component.setRawValue || component.setValue).call(component, value);

            callback && this.processCallbackFromTest(callback, null, scope)
        },


        /**
         * Waits until no ongoing animations can be detected.
         *
         * @param {Function} callback The callback to call after the component becomes visible
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value.
         */
        waitForAnimations: function (callback, scope, timeout) {
            var R   = Siesta.Resource('Siesta.Test.ExtJS');
            var me  = this;

            return this.waitFor({
                method          : function () { return !me.areAnimationsRunning(); },
                callback        : callback,
                scope           : scope,
                timeout         : timeout,
                assertionName   : 'waitForAnimations',
                description     : ' ' + R.get('animationsToFinalize')
            });
        },
        
        
        /**
         * This method resolves a query string, as defined by the {@link Siesta.Test.ActionTarget}. See the link for details,
         * here we'll just briefly mention, that by default string supposed to be a CSS query. If it starts with `>>`
         * it will be recognized as Component query. And if it contains the `=>` characters, then it will be 
         * considered a {@link compositeQuery compositeQuery}.
         * 
         * @param {String} selector
         * @return {Array[Element]}
         */
        query : function (selector) {
            var me              = this
            var result

            if (selector.match(/=>/)) {
                // Composite query
                result          = this.compositeQuery(selector, null, true, false)
            } else if (selector.match(/^\s*>>/)) {
                // Component query
                result          = this.componentQuery(selector, null, { ignoreNonVisible : false })
                
                result          = Joose.A.map(result, function (cmp) { return me.compToEl(cmp).dom })
                
            } else {
                // DOM query
                result          = this.sizzle(selector)
            }

            return result
        }
    }
})
