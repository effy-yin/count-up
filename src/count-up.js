class CountUp {
    constructor(target, endVal, options) {
        this.version = '2.0.2';
        this.el = (typeof target === 'string') ? document.getElementById(target) : target;
        if (!this.el) {
            this.error = '[CountUp] target is null or undefined';
            //   console.log(this.error);
            return;
        }

        this.defaults = {
            startVal: 0,
            decimalPlaces: 0,
            duration: 2,
            useEasing: true,
            useGrouping: true,
            smartEasingThreshold: 999,
            smartEasingAmount: 333,
            separator: ',',
            decimal: '.',
            prefix: '',
            suffix: '',
        };
        this.options = Object.assign({}, this.defaults, options);


        this.startVal = this.validateValue(this.options.startVal);
        this.endVal = this.validateValue(endVal);
        this.frameVal = this.startVal;
        this.finalEndVal = null; // for smart easing
        this.useEasing = this.options.useEasing;
        this.countDown = false;
        this.paused = true;


        this.formattingFn = (this.options.formattingFn)
            ? this.options.formattingFn : this.formatNumber;
        this.easingFn = (this.options.easingFn) ? this.options.easingFn : CountUp.easeOutExpo;
        this.options.decimalPlaces = Math.max(0 || this.options.decimalPlaces);
        this.decimalMult = Math.pow(10, this.options.decimalPlaces);

        this.options.separator = String(this.options.separator);

        if (this.options.separator === '') {
            this.options.useGrouping = false;
        }


        this.resetDuration();
        this.printValue(this.startVal);

        const _this = this;
        this.count = (timestamp) => {
            if (!_this.startTime) {
                _this.startTime = timestamp;
            }
            const progress = timestamp - _this.startTime;
            _this.remaining = _this.duration - progress;
            // to ease or not to ease
            if (_this.useEasing) {
                if (_this.countDown) {
                    _this.frameVal = _this.startVal - _this.easingFn(progress, 0, _this.startVal - _this.endVal, _this.duration);
                } else {
                    _this.frameVal = _this.easingFn(progress, _this.startVal, _this.endVal - _this.startVal, _this.duration);
                }
            } else if (_this.countDown) {
                _this.frameVal = _this.startVal - ((_this.startVal - _this.endVal) * (progress / _this.duration));
            } else {
                _this.frameVal = _this.startVal + (_this.endVal - _this.startVal) * (progress / _this.duration);
            }
            // don't go past endVal since progress can exceed duration in the last frame
            if (_this.countDown) {
                _this.frameVal = (_this.frameVal < _this.endVal) ? _this.endVal : _this.frameVal;
            } else {
                _this.frameVal = (_this.frameVal > _this.endVal) ? _this.endVal : _this.frameVal;
            }
            // decimal
            _this.frameVal = Math.round(_this.frameVal * _this.decimalMult) / _this.decimalMult;
            // format and print value
            _this.printValue(_this.frameVal);
            // whether to continue
            if (progress < _this.duration) {
                _this.rAF = requestAnimationFrame(_this.count);
            } else if (_this.finalEndVal !== null) {
                // smart easing
                _this.update(_this.finalEndVal);
            } else if (_this.callback) {
                _this.callback();
            }
        };
    }

    start(callback) {
        if (this.error) {
            return;
        }
        this.callback = callback;
        if (this.duration > 0) {
            this.determineDirectionAndSmartEasing();
            this.paused = false;
            this.rAF = requestAnimationFrame(this.count);
        } else {
            this.printValue(this.endVal);
        }
    }

    pauseResume() {
        if (!this.paused) {
            cancelAnimationFrame(this.rAF);
        } else {
            this.startTime = null;
            this.duration = this.remaining;
            this.startVal = this.frameVal;
            this.determineDirectionAndSmartEasing();
            this.rAF = requestAnimationFrame(this.count);
        }
        this.paused = !this.paused;
    }

    reset() {
        cancelAnimationFrame(this.rAF);
        this.paused = true;
        this.resetDuration();
        this.startVal = this.validateValue(this.options.startVal);
        this.frameVal = this.startVal;
        this.printValue(this.startVal);
    }

    update() {
        cancelAnimationFrame(this.rAF);
        this.startTime = null;
        this.endVal = this.validateValue(this.endVal);
        if (this.endVal === this.frameVal) {
            return;
        }
        this.startVal = this.frameVal;
        if (!this.finalEndVal) {
            this.resetDuration();
        }
        this.determineDirectionAndSmartEasing();
        this.rAF = requestAnimationFrame(this.count);
    }

    resetDuration() {
        this.startTime = null;
        this.duration = Number(this.options.duration) * 1000;
        this.remaining = this.duration;
    }
    // count(timestamp) {console.log(this)
    // }

    determineDirectionAndSmartEasing() {
        const end = (this.finalEndVal) ? this.finalEndVal : this.endVal;
        this.countDown = (this.startVal > end);
        const animateAmount = end - this.startVal;
        if (Math.abs(animateAmount) > this.options.smartEasingThreshold) {
            this.finalEndVal = end;
            const up = (this.countDown) ? 1 : -1;
            this.endVal = end + (up * this.options.smartEasingAmount);
            this.duration = this.duration / 2;
        } else {
            this.endVal = end;
            this.finalEndVal = null;
        }
        if (this.finalEndVal) {
            this.useEasing = false;
        } else {
            this.useEasing = this.options.useEasing;
        }
    }

    printValue(val) {
        const result = this.formattingFn(val);
        if (this.el.tagName === 'INPUT') {
            const input = this.el;
            input.value = result;
        } else if (this.el.tagName === 'text' || this.el.tagName === 'tspan') {
            this.el.textContent = result;
        } else {
            this.el.innerHTML = result;
        }
    }

    static ensureNumber(n) {
        return (typeof n === 'number' && !isNaN(n));
    }

    validateValue(value) {
        const newValue = Number(value);
        if (!CountUp.ensureNumber(newValue)) {
            this.error = `[CountUp] invalid start or end value: ${value}`;
            return null;
        }

        return newValue;
    }

    formatNumber(num) {
        const neg = (num < 0) ? '-' : '';
        let result; let
            x1; let x2; let
            x3;
        result = Math.abs(num).toFixed(this.options.decimalPlaces);
        const x = result.split('.');

        result += '';

        [x1] = x; // x1=x[0]
        x2 = x.length > 1 ? this.options.decimal + x[1] : '';
        if (this.options.useGrouping) {
            x3 = '';
            for (let i = 0, len = x1.length; i < len; ++i) {
                if (i !== 0 && (i % 3) === 0) {
                    x3 = this.options.separator + x3;
                }
                x3 = x1[len - i - 1] + x3;
            }
            x1 = x3;
        }
        // optional numeral substitution
        if (this.options.numerals && this.options.numerals.length) {
            x1 = x1.replace(/[0-9]/g, function (w) { return this.options.numerals[+w]; });
            x2 = x2.replace(/[0-9]/g, function (w) { return this.options.numerals[+w]; });
        }
        return neg + this.options.prefix + x1 + x2 + this.options.suffix;
    }

    static easeOutExpo(t, b, c, d) {
        return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
    }
}
