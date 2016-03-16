function FormBody() {
  if (!(this instanceof FormBody)) {
    return new FormBody();
  }

  var form;
  var submitBtn;
  var components = [];

  this.addComponent = function addComponent(comp) {
    if (!form) {
      console.error('FormBody: Form not initialised.');
      return;
    } else if (!comp) {
      console.error('FormBody: No element to be added included.');
      return;
    } else {
      components.push(comp);
      form.insertBefore(comp.element, submitBtn);
      comp.configToggle(true);
    }
  };

  this.init = function () {
    form = document.createElement('form');
    form.classList.add('form-horizontal');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      console.log('Submit button clicked.');
      console.dir(components);
    });

    var _this = this;
    form.addEventListener('newElement', function (e) {
      if (!e.detail) {
        console.error('No data in "newElement" event.');
        return;
      }

      _this.addComponent(e.detail.comp);
    });

    submitBtn = document.createElement('input');
    submitBtn.setAttribute('type', 'submit');
    submitBtn.classList.add('btn');
    submitBtn.classList.add('col-sm-12');
    form.appendChild(submitBtn);
    this.element = form;
  };

  this.init();
}

/**
 * Parent class for form components
 * @abstract
 * @class FormComponent
 */
function FormComponent() {
  if (!(this instanceof FormComponent)) {
    return new FormComponent();
  }
}

FormComponent.prototype.init = function init(name) {
  if (typeof name !== 'string') {
    throw new Error('FormComponent: ' + name + ' is not a valid "name" parameter.');
  }

  this.element = document.createElement('div');
  this.element.classList.add('fl-component');
  this.element.classList.add('col-md-12');
  this.element.classList.add('form-group');

  this.content = document.createElement('div');
  this.content.classList.add('fl-form-content');
  this.element.appendChild(this.content);

  this.name = name;
  this.createControls();
};

FormComponent.prototype.createControls = function createControls() {

  //Create side control bar -----------------------------
  var controls = document.createElement('div');
  controls.classList.add('fl-component-side-control');

  var dragBtn = document.createElement('i');
  dragBtn.classList.add('glyphicon');
  dragBtn.classList.add('glyphicon-menu-hamburger');
  controls.appendChild(dragBtn);

  var moreConfigBtn = document.createElement('button');
  moreConfigBtn.setAttribute('type', 'button');
  moreConfigBtn.classList.add('glyphicon');
  moreConfigBtn.classList.add('glyphicon-pencil');
  controls.appendChild(moreConfigBtn);

  var _this = this;
  moreConfigBtn.addEventListener('click', function () {
    _this.configToggle();
  });

  //Create configuration box -----------------------------
  var configBox = document.createElement('div');
  configBox.classList.add('fl-component-config');
  this.configBox = configBox;

  //Component-specific content wrapper
  var configContent = document.createElement('div');
  configContent.classList.add('full-width');
  this.configContent = configContent;
  configBox.appendChild(configContent);

  //Bottom buttons container
  var buttonsContainer = document.createElement('div');
  buttonsContainer.classList.add('col-sm-12');

  var deleteBtn = document.createElement('button');
  deleteBtn.setAttribute('type', 'button');
  deleteBtn.classList.add('btn');
  deleteBtn.classList.add('btn-danger');
  deleteBtn.classList.add('btn-sm');
  deleteBtn.classList.add('fl-bottom-btn');
  deleteBtn.innerText = 'Delete';
  deleteBtn.addEventListener('click', function () {
    _this.destroy();
  });

  buttonsContainer.appendChild(deleteBtn);

  var okBtn = document.createElement('button');
  okBtn.setAttribute('type', 'button');
  okBtn.classList.add('btn');
  okBtn.classList.add('btn-default');
  okBtn.classList.add('btn-sm');
  okBtn.classList.add('fl-bottom-btn');
  okBtn.innerText = 'Ok';
  okBtn.addEventListener('click', function () {
    _this.saveConfig();
    _this.configToggle();
  });

  buttonsContainer.appendChild(okBtn);
  var requiredLabel = document.createElement('label');
  requiredLabel.innerText = 'Required';

  //Switch for whether the field is required or not.
  var requiredSwitch = document.createElement('div');
  requiredSwitch.classList.add('switch');

  var switchInput = document.createElement('input');
  switchInput.classList.add('cmn-toggle');
  switchInput.classList.add('cmn-toggle-round');
  switchInput.setAttribute('type', 'checkbox');
  switchInput.id = 'cmn-toggle-' + Date.now();
  switchInput.addEventListener('change', function (e) {
    var checked = e.target.checked;
    var wasChanged = _this.required(checked);
    if (!wasChanged) { e.target.checked = !checked; }
  });

  requiredSwitch.appendChild(switchInput);

  var switchLabel = document.createElement('label');
  switchLabel.setAttribute('for', switchInput.id);
  requiredSwitch.appendChild(switchLabel);

  requiredLabel.appendChild(requiredSwitch);
  buttonsContainer.appendChild(requiredLabel);

  configBox.appendChild(buttonsContainer);

  this.element.appendChild(configBox);
  this.element.appendChild(controls);
};

FormComponent.prototype.configToggle = function configToggle(showHide) {
  if (showHide === true) {
    this.showConfig();
  } else if (showHide === false) {
    this.hideConfig();
  } else { //toggle
    var configShowing = this.configShowing
    this.showConfig(!configShowing);
  }
};

FormComponent.prototype.hideConfig = function hideConfig() {
  if (!this.configBox) {
    throw new Error('FormComponent.configToggle(): No configBox initialised');
  }

  this.element.classList.remove('fl-form-config-visible');
  this.configShowing = false;

  var editables = this.element.querySelectorAll('.fl-editable');
  var placeholderMessage = 'Set a placeholder text.';

  [].forEach.call(editables, function (el) {
    el.setAttribute('contenteditable', false);

    //Show message to input placeholder text if there is no placeholder already
    //in place. Remove the message if placeholder wasn't set.
    if (el.nodeName === 'TEXTAREA' || (el.nodeName === 'INPUT' && el.type === 'text')) {
      var placeholderText = el.getAttribute('placeholder');
      var value = el.value;

      if (value) {
        el.setAttribute('placeholder', value);
      }else if (placeholderText ===  placeholderMessage) {
        el.removeAttribute('placeholder');
      }

      el.value = '';
    }
  });
};

FormComponent.prototype.showConfig = function showConfing() {
  if (!this.configBox) {
    throw new Error('FormComponent.showConfing(): No configBox initialised');
  } else if (this.configShowing) {
    return;
  }

  //Show config box and change configShowing value
  this.element.classList.add('fl-form-config-visible');
  this.configShowing = true;

  //Make appropriate elements editable.
  var editables = this.element.querySelectorAll('.fl-editable');
  var placeholderMessage = 'Set a placeholder text.';
  [].forEach.call(editables, function (el) {
    el.setAttribute('contenteditable', true);

    //Show message to input placeholder text if there is no placeholder already
    //in place. Remove the message if placeholder wasn't set.
    if (el.nodeName === 'TEXTAREA' || (el.nodeName === 'INPUT' && el.type === 'text')) {
      var placeholderText = el.getAttribute('placeholder');
      var newContent = (placeholderText) ? placeholderText : placeholderMessage;
      el.setAttribute('placeholder', newContent);
      el.value = '';
    }
  });

  //Focus on the appropriate element
  var focusElement = this.focusElement || this.configBox.querySelector('switch');
  if (focusElement) {
    //NOTE: There is a bug that for some reason it doesn't focus if you just
    //call focus() straight away. setTimeout solves it.
    //see http://goo.gl/UjKOk5
    setTimeout(function () { focusElement.focus(); }, 15);
  }

  //Set a listener to hide the configuration when the user clicks somewhere else.
  var _this = this;
  var listenerTarget = document.body;
  var useCapture = true;
  listenerTarget.addEventListener('mousedown', function clickOutOfComponent(e) {
    console.log('Listener called');
    var func = clickOutOfComponent;
    var clickX = e.clientX;
    var clickY = e.clientY;

    //If clicked outside of the component.
    if (!_this.isAtPoint(clickX, clickY)) {
      listenerTarget.removeEventListener('mousedown', func, useCapture);
      _this.hideConfig();
    }
  }, useCapture);
};

/**
 * Checks whether a point is inside a component or outside of it.
 * @method isAtPoint
 * @param  {integer}  x
 * @param  {integer}  y
 * @return {Boolean}   Whether point is inside component or not
 */
FormComponent.prototype.isAtPoint = function isAtPoint(x, y) {
  var configPosition = this.configBox.getBoundingClientRect();
  var componentPosition = this.element.getBoundingClientRect();

  var top = componentPosition.top;
  var bottom = configPosition.bottom;
  var right = Math.max(configPosition.right, componentPosition.right);
  var left = Math.min(configPosition.left, componentPosition.left);

  //If point is outside of the component
  if (x < left || right < x || y < top || bottom < y) {
    return false;
  } else {
    return true;
  }
};

/**
 * Creates an input field in the configContent which will call this.add with
 * its content value
 * @method createConfigInputField
 * @return {HTMLElement} The cretated element
 */
FormComponent.prototype.createConfigInputField = function createConfigInputField() {
  var legend = document.createElement('input');
  legend.setAttribute('placeholder', 'Description');
  legend.setAttribute('type', 'text');
  this.focusElement = legend;

  var addBtn = document.createElement('i');
  addBtn.classList.add('glyphicon');
  addBtn.classList.add('glyphicon-plus-sign');
  addBtn.classList.add('fl-grey-btn');

  var _this = this;
  addBtn.addEventListener('click', function () {

    //Blink red and return if no value was provided
    if (!legend.value.trim()) {
      legend.classList.add('fl-blink-red');
      setTimeout(function () {
        legend.classList.remove('fl-blink-red');
      }, 1500);

      return;
    }

    _this.add(legend.value);
    legend.value = '';
  });

  legend.addEventListener('keypress', function (e) {
    if (e.which === 13) {
      var click = new Event('click');
      addBtn.dispatchEvent(click);
      e.preventDefault();
      return false; // returning false will prevent the event from bubbling up.
    } else {
      return true;
    }
  });

  this.configContent.appendChild(addBtn);
  this.configContent.appendChild(legend);
};

//To be implemented by child clases
FormComponent.prototype.saveConfig = function saveConfig() {

};

FormComponent.prototype.destroy = function destroy() {
  this.element.remove();
};

/**
 * Sets checkboxes as required. Only does that if there is only one checkbox.
 * @method required
 * @param  {boolean} isRequired
 * @return {Boolean}      Whether required was set or not.
 */
FormComponent.prototype.required = function required(isRequired) {
  var inputs = this.content.querySelectorAll('input');
  var textAreas = this.content.querySelectorAll('textarea');
  inputs = [].slice.call(inputs);
  textAreas = [].slice.call(textAreas);

  var els = [].concat.call(inputs, textAreas);

  if (isRequired) {
    els.forEach(function (el) { el.setAttribute('required', true); });
  } else {
    els.forEach(function (el) { el.removeAttribute('required'); });
  }

  return true;
};

FormComponent.prototype.addPlaceHolder = function addPlaceHolder() {
  this.placeHolder = this.add('placeholder', 'Insert an option');
  this.placeHolder.setAttribute('disabled', true);
};

FormComponent.prototype.removePlaceHolder = function removePlaceHolder() {
  this.placeHolder.remove();
  this.placeHolder = null;
};

/*globals RadioBtns, Checkboxes, TextBox, TextArea, Dropdown*/

/**
 * Singleton to create form components
 * @class FormFabric
 * @param {HTMLElement} el Where the fabric will be put.
 */
function FormFabric(formBody) {
  if (!(this instanceof FormFabric)) {
    return new FormFabric();
  }

  var formComponents = [
    { desc: 'Radio buttons', constr: RadioBtns, class: 'glyphicon glyphicon-ok-circle' },
    { desc: 'Checkboxes', constr: Checkboxes, class: 'glyphicon glyphicon-check' },
    { desc: 'Dropdown', constr: Dropdown, class: 'glyphicon glyphicon-collapse-down' },
    { desc: 'Text box', constr: TextBox, class: 'glyphicon glyphicon-text-width' },
    { desc: 'Text area', constr: TextArea, class: 'glyphicon glyphicon-text-height' },
  ];

  function createElement(Constr, formBody) {
    var name = 'Temp name' + (Math.floor(Math.random() * 1000));
    var comp = new Constr(name);
    var ev = new CustomEvent('newElement',
      {
        detail: {	comp: comp },
        bubbles: true,
        cancelable: true,
      });

    formBody.dispatchEvent(ev);
  }

  /**
   * @function createOptionsDropdown
   * @return {HTMLElement} The dropdown menu
   */
  function createOptions() {
    // var select = document.createElement('select');
    // select.classList.add('form-control');
    // select.style.display = 'inline';
    // select.style.minWidth = '0';
    // select.style.maxWidth = '200px';
    var frag = document.createDocumentFragment();
    formComponents.forEach(function (component, idx) {
      var op = document.createElement('button');
      op.setAttribute('value', idx);
      op.className = component.class;
      op.classList.add('btn');
      op.classList.add('btn-default');
      op.addEventListener('click', function (e) {
        var idx = op.value;
        console.log('Create a ', formComponents[idx].desc);
        createElement(formComponents[idx].constr, formBody);
      });

      frag.appendChild(op);
    });

    return frag;
  }

  this.init = function init() {
    this.element = document.createElement('div');
    this.element.classList.add('fl-form-fabric');
    var options = createOptions();
    //
    // var addBtn = document.createElement('button');
    // addBtn.classList.add('btn');
    // addBtn.classList.add('slight-margin-right');
    // addBtn.innerText = 'Add';
    // addBtn.addEventListener('click', function () {
    //   var idx = options.selectedIndex;
    //   console.log('Create a ', formComponents[idx].desc);
    //   createElement(formComponents[idx].constr, formBody);
    // });
    //
    // this.element.appendChild(addBtn);
    this.element.appendChild(options);
  };

  this.init(formBody);
}

/*globals FormComponent*/

/**
 * @class Checkboxes
 * @extends FormComponent
 */
function Checkboxes(name) {
  if (!(this instanceof Checkboxes)) { return new Checkboxes(); }

  this.init(name);
}

Checkboxes.prototype = new FormComponent(); //Inheritance part

/**
 * init() is automatically called in construction by FormComponent, the parent class
 * @override @method init
 * @param  {String} name
 * @return {void}
 */
Checkboxes.prototype.init = function init(name) {
  this.constructor.prototype.init.call(this, name); // parent class init.

  this.name = name + '[]';
  this.isRequired = false;

  this.createConfigInputField();
  this.addPlaceHolder();
};

/**
 * Adds one checkbox to a group of checkboxes.
 * @method add
 * @param {String} value  value that will be sent on form submit
 * @param {String} legend [optional]
 */
Checkboxes.prototype.add = function add(value, legend) {
  if (!value) {
    throw new Error('Checkboxes.add(): No value parameter provided.');
  } else if (this.isRequired && this.countBoxes() > 1) {
    console.error('Checkboxes: To be "required" there can only be one checkbox in the group');
  } else if (this.placeHolder) {
    this.removePlaceHolder();
  }

  var newBox = document.createElement('input');
  newBox.setAttribute('type', 'checkbox');
  newBox.setAttribute('name', this.name);
  newBox.setAttribute('value', value);
  newBox.classList.add('fl-check-box');

  if (this.isRequired) { newBox.setAttribute('required', true); }

  var legendNode = document.createElement('span');
  legendNode.innerText = legend || value;
  legendNode.classList.add('fl-editable');

  var label = document.createElement('label');
  label.appendChild(newBox);
  label.appendChild(legendNode);
  this.content.appendChild(label);
  return label;
};

/**
 * Sets checkboxes as required. Only does that if there is only one checkbox.
 * @override @method required
 * @param  {boolean} isRequired
 * @return {Boolean}      Whether required was set or not.
 */
Checkboxes.prototype.required = function required(isRequired) {
  if (this.countBoxes() > 1 && isRequired) {
    console.error('Checkboxes: To be "required" there can only be one checkbox in the group');
    return false;
  }

  this.isRequired = isRequired;
  var boxes = this.getBoxes();
  if (isRequired) {
    boxes.forEach(function (box) { box.setAttribute('required', true); });
  } else {
    boxes.forEach(function (box) { box.removeAttribute('required'); });
  }

  return true;
};

/**
 * @method countBoxes
 * @return {integer} Amount of checkboxes in the component
 */
Checkboxes.prototype.countBoxes = function () {
  return this.content.childElementCount;
};

/**
 * @method getBoxes
 * @return {Array} collection of checkbox HTMLElements
 */
Checkboxes.prototype.getBoxes = function () {
  return [].slice.call(this.content.querySelectorAll('input'));
};

/**
 * @override addPlaceHolder
 */
Checkboxes.prototype.addPlaceHolder = function addPlaceHolder() {
  this.placeHolder = this.add('placeholder', 'Check a box');
};

/*globals FormComponent*/

/**
 * @class Dropdown
 * @extends FormComponent
 */
function Dropdown(name) {
  if (!(this instanceof Dropdown)) { return new Dropdown(); }

  this.init(name);
}

Dropdown.prototype = new FormComponent(); //Inheritance part

/**
 * init() is automatically called in construction by FormComponent, the parent class
 * @override @method init
 * @param  {String} name
 * @return {void}
 */
Dropdown.prototype.init = function init(name) {
  this.constructor.prototype.init.call(this, name); // parent class init.

  var labelEl = document.createElement('div');
  labelEl.classList.add('full-width');

  var labelText = document.createElement('label');
  labelText.innerText = 'Dropdown ';
  labelText.classList.add('fl-editable');
  this.labelText = labelText;
  labelEl.appendChild(labelText);

  this.wrapper = document.createElement('select');
  this.wrapper.setAttribute('name', name);
  this.wrapper.classList.add('fl-dropdown');
  this.wrapper.classList.add('form-control');
  labelEl.appendChild(this.wrapper);

  this.content.appendChild(labelEl);

  this.createConfigInputField();
  this.addPlaceHolder();
};

/**
 * Adds a new option to the dropdown
 * @method add
 * @param {String} value
 * @param {String} legend [optional]
 * @return {HTMLElement} the option created
 */
Dropdown.prototype.add = function add(value, legend) {
  if (!value) {
    throw new Error('Dropdown.add(): ' + value + ' is not a valid "value" value.');
  } else if (this.placeHolder) {
    this.removePlaceHolder();
  }

  var newOp = document.createElement('option');
  newOp.setAttribute(value, value);
  newOp.innerText = legend || value;
  this.wrapper.appendChild(newOp);
  return newOp;
};

Dropdown.prototype.addPlaceHolder = function addPlaceHolder() {
  this.placeHolder = this.add('placeholder', 'Select an option');
  this.placeHolder.setAttribute('disabled', true);
  this.placeHolder.setAttribute('selected', true);
};

/*globals FormComponent*/

/**
 * @class RadioBtns
 * @extends FormComponent
 */
function RadioBtns(name) {
  if (!(this instanceof RadioBtns)) { return new RadioBtns(); }

  this.init(name);
}

RadioBtns.prototype = new FormComponent(); //Inheritance part

/**
 * init() is automatically called in construction by FormComponent, the parent class
 * @override @method init
 * @param  {String} name
 * @return {void}
 */
RadioBtns.prototype.init = function init(name) {
  this.constructor.prototype.init.call(this, name); // parent class init.

  this.createConfigInputField();

  //Add placeholder
  this.addPlaceHolder();
};

/**
 * @method add
 * @param {String} value
 * @param {String} legend [optional]
 * @return HTMLElement the element added
 */
RadioBtns.prototype.add = function add(value, legend) {
  if (!value) {
    throw new Error('RadioBtns.add(): ' + value + ' is not a valid "value" parameter');
  } else if (this.placeHolder) {
    this.removePlaceHolder();
  }

  var newRadio = document.createElement('input');
  newRadio.setAttribute('type', 'radio');
  newRadio.setAttribute('name', this.name);
  newRadio.setAttribute('value', value);
  newRadio.classList.add('fl-radio-btn');

  var newLabel = document.createElement('label');
  var labelText = document.createTextNode(legend || value);
  newLabel.appendChild(newRadio);
  newLabel.appendChild(labelText);

  this.content.appendChild(newLabel);
  return newLabel;
};

/*globals FormComponent*/

/**
 * @class TextArea
 * @extends FormComponent
 */
function TextArea(name) {
  if (!(this instanceof TextArea)) { return new TextArea(); }

  this.init(name);
}

TextArea.prototype = new FormComponent(); //Inheritance part

/**
 * init() is automatically called in construction by FormComponent, the parent class
 * @override @method init
 * @param  {String} name
 * @return {void}
 */
TextArea.prototype.init = function init(name) {
  this.constructor.prototype.init.call(this, name); // parent class init.
  var labelEl = document.createElement('div');
  labelEl.classList.add('full-width');

  var labelText = document.createElement('label');
  labelText.innerText = 'Text Area ';
  labelText.classList.add('fl-editable');
  this.labelText = labelText;
  labelEl.appendChild(labelText);

  var area = document.createElement('textarea');
  area.setAttribute('name', name);
  area.setAttribute('rows', 5);
  area.classList.add('fl-editable');
  area.classList.add('fl-text-area');
  area.classList.add('form-control');
  labelEl.appendChild(area);

  this.content.appendChild(labelEl);
};

TextArea.prototype.setLabel = function setLabel(desc) {
  if (!desc || !this.labelText) { return; }

  this.labelText.innerText = desc;
};

/*globals FormComponent*/

/**
 * @class TextBox
 * @extends FormComponent
 */
function TextBox(name) {
  if (!(this instanceof TextBox)) { return new TextBox(); }

  this.init(name);
}

TextBox.prototype = new FormComponent(); //Inheritance part

/**
 * init() is automatically called in construction by FormComponent, the parent class
 * @override @method init
 * @param  {String} name
 * @return {void}
 */
TextBox.prototype.init = function init(name) {
  this.constructor.prototype.init.call(this, name); // parent class init.

  //Create the text box
  var labelEl = document.createElement('div');
  labelEl.classList.add('full-width');

  var labelText = document.createElement('label');
  labelText.classList.add('fl-editable');
  labelText.innerText = 'Text ';
  this.labelText = labelText;
  labelEl.appendChild(labelText);

  var box = document.createElement('input');
  box.setAttribute('type', 'text');
  box.setAttribute('name', name);
  box.classList.add('fl-editable');
  box.classList.add('fl-text-box');
  box.classList.add('form-control');
  labelEl.appendChild(box);

  this.content.appendChild(labelEl);
};

TextBox.prototype.setLabel = function setLabel(desc) {
  if (!desc || !this.labelText) { return; }

  this.labelText.innerText = desc;
};

/*globals FormFabric, FormBody, xController*/

xController(function flFormBuilder(xDivEl) {
  xDivEl.innerText = "I'm working!";

  var formBody = new FormBody();
  var fabric = new FormFabric(formBody.element);

  xDivEl.classList.add('container');
  xDivEl.appendChild(fabric.element);
  xDivEl.appendChild(formBody.element);
});
