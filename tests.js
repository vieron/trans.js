var expect = chai.expect;

var box = function(cls) {
    return '<div class="box-' + cls + '" />';
};

var checkAllTransEndEvents = function(transLength) {
    it('should fire `trans:end events for each transitioned attribute using #addTransClass', function(done) {
        this.timeout(3000);
        var _done = _.after(transLength || 4, done.bind(this));

        this.$box.on('trans:end', function() {
            _done();
        });

        this.$box.addTransClass('js-active');
    });

    it('should fire `trans:end events for each transitioned attribute using #removeTransClass', function(done) {
        this.timeout(3000);
        this.$box.addClass('js-active');
        var _done = _.after(transLength || 4, done.bind(this));

        this.$box.on('trans:end', function() {
            _done();
        });

        this.$box.removeTransClass('js-active');
    });
};


describe('trans.js', function() {
    'use strict';

    beforeEach(function() {
        this.$box = $(box('regular-trans'));
        $('#fixture').append(this.$box);
    });

    afterEach(function() {
        this.$box.data('trans').destroy();
        this.$box.remove();
    });

    it('should return an instance of Trans when calling data("trans")', function() {
        this.$box.addTransClass('js-active');
        var ins = this.$box.data('trans');
        expect(ins).to.be.instanceof(ins.constructor);
        expect(ins).to.respondTo('transition');
    });

    checkAllTransEndEvents.call(this);

    it('should fire `trans:end:propKey` events', function(done) {
        this.timeout(3000);

        this.$box.on('trans:end:background-color', function() {
            done();
        });

        this.$box.addTransClass('js-active');
    });

    it('should fire `trans:endAll` event when all transitions finish', function(done) {
        this.timeout(3000);

        this.$box.on('trans:endAll', function() {
            done();
        });

        this.$box.addTransClass('js-active');
    });
});



describe('trans.js opacity + display block/none', function() {
    'use strict';

    beforeEach(function() {
        this.$box = $(box('opacity-display-trans'));
        $('#fixture').append(this.$box);
    });

    afterEach(function() {
        this.$box.data('trans').destroy();
        this.$box.remove();
    });

    it('should set display property to none', function(done) {
        this.$box.on('trans:endAll', function(e, ins) {
            expect(ins.$el.css('display')).to.equal('none');
            done();
        });

        this.$box.addTransClass('js-active');
    });

    it('should set display property to block', function(done) {
        this.$box.addClass('js-active');

        this.$box.on('trans:endAll', function(e, ins) {
            expect(ins.$el.css('display')).to.equal('block');
            done();
        });

        this.$box.removeTransClass('js-active');
    });

    checkAllTransEndEvents.call(this);

});


describe('trans.js width + display block/none', function() {
    'use strict';

    beforeEach(function() {
        this.$box = $(box('width-display-trans'));
        $('#fixture').append(this.$box);
    });

    afterEach(function() {
        this.$box.data('trans').destroy();
        this.$box.remove();
    });

    it('should set display property to none and width to 0px', function(done) {
        this.$box.on('trans:endAll', function(e, ins) {
            console.log('trans_enddAll')
            expect(ins.$el.css('display')).to.equal('none');
            expect(ins.$el.css('width')).to.equal('0px');
            done();
        });

        this.$box.addTransClass('js-active');
    });

    it('should set display property to block and width to original', function(done) {
        this.$box.addClass('js-active');

        this.$box.on('trans:endAll', function(e, ins) {
            expect(ins.$el.css('display')).to.equal('block');
            expect(ins.$el.css('width')).to.equal('200px');
            done();
        });

        this.$box.removeTransClass('js-active');
    });

    checkAllTransEndEvents.call(this, 3);

});


describe('trans.js height + display block/none', function() {
    'use strict';

    beforeEach(function() {
        this.$box = $(box('height-display-trans'));
        $('#fixture').append(this.$box);
    });

    afterEach(function() {
        this.$box.data('trans').destroy();
        this.$box.remove();
    });

    it('should set display property to none and height to 0px', function(done) {
        this.$box.on('trans:endAll', function(e, ins) {
            console.log('trans_enddAll')
            expect(ins.$el.css('display')).to.equal('none');
            expect(ins.$el.css('height')).to.equal('0px');
            done();
        });

        this.$box.addTransClass('js-active');
    });

    it('should set display property to block and height to original', function(done) {
        this.$box.addClass('js-active');

        this.$box.on('trans:endAll', function(e, ins) {
            expect(ins.$el.css('display')).to.equal('block');
            expect(ins.$el.css('height')).to.equal('400px');
            done();
        });

        this.$box.removeTransClass('js-active');
    });

    checkAllTransEndEvents.call(this, 3);
});


describe('trans.js utilities', function() {
    'use strict';

    beforeEach(function() {
        this.$box = $(box('regular-trans'));
        $('#fixture').append(this.$box);
    });

    afterEach(function() {
        this.$box.remove();
    });

    it('should fire callback when using `transEnd` method', function(done) {
        this.timeout(3000);

        this.$box.transEnd(function() {
            done();
        });

        _.defer(function() {
            this.$box.addClass('js-active');
        }.bind(this));
    });

    it('should fire callback when using `transEnd` jQuery event type', function(done) {
        this.timeout(3000);

        this.$box.one('transEnd', function() {
            done();
        });

        _.defer(function() {
            this.$box.addClass('js-active');
        }.bind(this));
    });
});