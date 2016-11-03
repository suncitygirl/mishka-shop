'use strict';

var DataValidator = (function() {

    var regExps = {
        email: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
        numbers: /^\d+(\.\d{1,2})?$/,
        digits: /[0-9]*$/,
        letters: /[a-z][A-Z]*$/,
        phone: function(str) {
            var numb = str.match(/\d/g);
            if (numb == null) return false;
            if (numb.length < 10) return false;
            if (numb.length > 11) return false;
            if (numb.length == 11) {
                if (numb[0] != 7 && numb[0] != 8) return false;
            }
            if (str.search(/\(/) != -1 || str.search(/\)/) != -1) {
                if (str.search(/\(\d{3}\)/) == -1) return false;
            }
            if (str.search(/[^\d\s-+\(\)]/gi) !== -1) {
                return false;
            }
            if (str[0] == '-') return false;

            return true;
        }

    };

    var DataValidator = function(data) {
        this.data = data.trim();
        this.length = this.data.length;
    };

    DataValidator.prototype.min = function(param) {
        return this.length >= param;
    };
    DataValidator.prototype.max = function(param) {
        return this.length <= param;
    };
    DataValidator.prototype.required = function() {
        return this.length > 0;
    };
    DataValidator.prototype.match = function(param) {
        if (param !== 'phone')
            return regExps[param].test(this.data);
        else return regExps.phone(this.data);
    };

    DataValidator.prototype.init = function(rules) {
        var results = {
            data: this.data,
            passed: [],
            failed: []
        };

        for (var rule in rules) {
            var param = rules[rule];
            var config = {
                rule: rule,
                param: param
            };

            if (!this[rule](param)) {
                results.failed.push(config);
            } else {
                results.passed.push(config);
            }
        }

        results.valid = results.failed.length === 0;

        return results;
    };

    return DataValidator;
})();

var InputValidator = (function() {

    var _createMessage = function(message, settings) {
        for (var key in settings) {
            message = message.replace('%' + key + '%', settings[key]);
        }
        return message;
    };

    var InputValidator = function(element, settings) {
        this.element = element;
        this.settings = settings;
    };

    InputValidator.prototype = Object.create(DataValidator.prototype);
    InputValidator.prototype.constructor = DataValidator;

    InputValidator.prototype.validate = function() {
        DataValidator.call(this, this.element.value);
        var results = this.init(this.settings.rules);
        if (!results.valid) {
            var failed = results.failed[0];
            this.message = _createMessage(this.settings.messages[failed.rule], {
                data: results.data,
                rule: failed.param
            });
            this.settings.onError.call(this);
        } else {
            this.settings.onSuccess.call(this);
        }
    };

    return InputValidator;
})();

var onError = function() {
    console.log(this.message);
    this.element.style.borderBottom = 'solid 2px red';
}

var onSuccess = function() {
    console.log('OK');
}

var form = document.getElementsByClassName('order-form')[0];

var emailInput = new InputValidator(form.elements.email, {
    rules: {
        min: 5,
        max: 50,
        match: 'email',
        required: true
    },
    messages: {
        min: 'Это поле должно содержать минимум %rule% символов',
        max: 'Это поле должно содержать максимум %rule% символов',
        match: 'Это поле должно содержать адрес электронной почты',
        required: 'Это поле обязательно для заполнения'

    },
    onError: onError,
    onSuccess: onSuccess
});

var phoneInput = new InputValidator(form.elements.phone, {
    rules: {
        min: 5,
        max: 20,
        match: 'phone',
        required: true
    },
    messages: {
        min: 'Некорректное значение',
        max: 'Некорректное значение',
        match: 'Это поле должно содержать телефонный номер',
        required: 'Это поле обязательно для заполнения'
    },
    onError: onError,
    onSuccess: onSuccess
})

form.addEventListener('submit', function(event) {
    event.preventDefault();
    emailInput.validate();
    phoneInput.validate();
});
