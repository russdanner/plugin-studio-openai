"use strict";

(function () {
  var React = CrafterCMSNext.React;
  var ReactDOM = CrafterCMSNext.ReactDOM;
  var CrafterCMSNextBridge = CrafterCMSNext.components.CrafterCMSNextBridge;
  var ConfirmDialog = CrafterCMSNext.components.ConfirmDialog;

  function TextGen(props) {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [locale, setLocale] = React.useState(props.locale);

    const DEFAULT_FIELDS_MAX_LENGTH = 50;

    React.useEffect(() => {

    }, []);


    return (
      <>
      { true (
        <>
          Foo
          <CrafterCMSNextBridge>
            Bar
          </CrafterCMSNextBridge>
        </>
      )}
      </>
    );
  }

  CStudioForms.Controls.TextGen = CStudioForms.Controls.TextGen || function (id, form, owner, properties, constraints) {
    this.owner = owner;
    this.owner.registerField(this);
    this.errors = [];
    this.properties = properties;
    this.constraints = constraints;
    this.inputEl = null;
    this.countEl = null;
    this.required = false;
    this.value = '_not-set';
    this.form = form;
    this.id = id;
    this.supportedPostFixes = ['_s'];

    return this;
  };

  YAHOO.extend(CStudioForms.Controls.TextGen, CStudioForms.CStudioFormField, {
    getLabel: function () {
      return 'OpenAI Text Generator';
    },

    _renderReactComponent: function(obj) {
      const instrumentTimer = setInterval(() => {
      
        if (typeof $ !== 'function') return;
        
        const inputEls = $.find('.cstudio-form-control-input')
        
        if(inputEls) {
          inputEls.forEach(element => {
            const parentElement = element.parentNode;
            var buttonEl = document.createElement("button");

            buttonEl.innerHTML = "Help Me Write";
            buttonEl.style = "background: rgb(44, 109, 178); border: none; color: white; text-align: center; border-radius: 20px; margin: 5px;";
            
            buttonEl.parentEl = element;
            buttonEl.onclick = function() {
              
              var subject = prompt("Tell me about the subject");

              const api = window.location.protocol 
                        + "//" 
                        + window.location.host 
                        + "/api/plugins/org/rd/plugin/openai/openai/gentext.json?"
                        + "subject="+subject
                        + "&fieldName=Title";


              fetch(api, { method: 'GET'})
              .then(response => response.json())      
              .then(result => {

                var text = result[0].text;
                text = text.replaceAll('"',"") 

                this.parentEl.value =  text;
              });
            }

            parentElement.appendChild(buttonEl);
          });
        }


        clearInterval(instrumentTimer);
      
      }, 3000);


    },

    render: function (config, containerEl) {
      containerEl.id = this.id;
      this._renderReactComponent(this);
    },

    getValue: function () {
      return this.value;
    },

    setValue: function (value) {
      this.value = value;
    },

    getName: function () {
      return 'textgen';
    },

    getSupportedProperties: function () {
      return [];
    },
    getSupportedConstraints: function () {
      return [];
    },
    getSupportedPostFixes: function () {
      return this.supportedPostFixes;
    }
  });

  CStudioAuthoring.Module.moduleLoaded('textgen', CStudioForms.Controls.TextGen);
})();