'use strict';

var expect = chai.expect;

var defer = function(fn, ctx) {
    setTimeout(fn, 0);
}

var createElement = function(cls) {
    this.fixture = document.querySelector('#fixture');
    this.box = document.createElement("div");
    this.box.classList.add('box-' + cls);
    this.fixture.appendChild(this.box);
    return this.box;
};

var removeElement = function() {
    this.fixture.removeChild(this.box);
}

var css = function(el, prop) {
    var style = window.getComputedStyle(el, null);
    return style.getPropertyValue(prop);
}

var lipsum = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perspiciatis quaerat dignissimos unde, nobis, fugit inventore quae facilis enim nemo nisi exercitationem voluptas pariatur ut magni officia aliquam asperiores? Omnis, iusto.';

// add #fixture div when running tests with karma
if (document.body) {
    var fixture = document.createElement('div'); fixture.setAttribute('id', 'fixture');
    document.querySelector('#fixture') || document.body.appendChild(fixture);
}


describe('trans.js', function() {

    describe('transEnd callback', function() {
        beforeEach(function() {
            createElement.call(this, 'regular-trans');
        });

        afterEach(function() {
            removeElement.call(this);
        });

        it('should fire `endAll` callback when the whole transition finished', function(done) {
            this.timeout(6000);
            Trans.transEndAll(this.box, function() {
                Trans.transEndAll(this.box, function() {
                    done();
                }.bind(this));
                this.box.classList.remove('js-active');
            }.bind(this));
            this.box.classList.add('js-active');
        });
    });


    describe('regular transition', function() {
        beforeEach(function() {
            createElement.call(this, 'regular-trans');
        });

        afterEach(function() {
            removeElement.call(this);
        });

        it('should fire `end` callback per transitioned property', function(done) {
            this.timeout(2000);
            var _done = _.after(4, done);
            var transitionedProps = ['background-color', 'width', 'height', 'transform', '-webkit-transform'];

            Trans.addTransClass(this.box, 'js-active', {
                end: function(el, propKey) {
                    // for browsers not supporting css transitions
                    if (propKey === 'all') {
                        done();
                    }
                    // for the rest of browsers
                    else {
                        expect(transitionedProps).to.contain(propKey);
                        _done();
                    }
                }
            });
        });

        it('should fire `endAll` callback when the whole transition transitions finish', function(done) {
            this.timeout(4000);

            // passing endAll callback function as second argument and as config object
            Trans.addTransClass(this.box, 'js-active', function() {
                Trans.removeTransClass(this.box, 'js-active', {
                    endAll: function() {
                        done();
                    }
                });
            }.bind(this));
        });

        it('should fire `end` and `endAll` callbacks with transitions disabled', function(done) {
            var _done = _.after(4, done);

            Trans.addTransClass(this.box, 'js-active', {
                end: function() { _done(); },
                endAll: function() {
                    _done();

                    Trans.removeTransClass(this.box, 'js-active', {
                        end: function() { _done(); },
                        endAll: function() { _done(); }
                    }, false);
                }.bind(this)
            }, false);
        });
    });


    describe('opacity + display block/none', function() {
        beforeEach(function() {
            createElement.call(this, 'opacity-display-trans');
        });

        afterEach(function() {
            removeElement.call(this);
        });

        it('should set display property to none', function(done) {
            Trans.addTransClass(this.box, 'js-active', function() {
                expect(css(this.box, 'display')).to.equal('none');
                done();
            }.bind(this));
        });

        it('should set display property to block', function(done) {
            this.box.classList.add('js-active');

            Trans.removeTransClass(this.box, 'js-active', function() {
                expect(css(this.box, 'display')).to.equal('block');
                done();
            }.bind(this));
        });
    });


    describe('height auto/0', function() {
        beforeEach(function() {
            createElement.call(this, 'height-auto-trans');
            // TODO: test without content
            this.box.innerHTML = lipsum;
            this.initialHeight = this.box.offsetHeight;
        });

        afterEach(function() {
            removeElement.call(this);
        });

        it('should set height to 0', function(done) {
            Trans.addTransClass(this.box, 'js-active', function() {
                expect(this.box.offsetHeight).to.equal(0);
                done();
            }.bind(this));
        });

        it('should set height to the initial one', function(done) {
            this.box.classList.add('js-active');

            Trans.removeTransClass(this.box, 'js-active', function() {
                expect(this.box.offsetHeight).to.equal(this.initialHeight);
                done();
            }.bind(this));
        });
    });


    describe('width auto/0', function() {
        beforeEach(function() {
            createElement.call(this, 'width-auto-trans');
            // TODO: test without content
            this.box.innerHTML = lipsum;
            this.initialWidth = this.box.offsetWidth;
        });

        afterEach(function() {
            removeElement.call(this);
        });

        it('should set width to 0', function(done) {
            Trans.addTransClass(this.box, 'js-active', function() {
                expect(this.box.offsetWidth).to.equal(0);
                done();
            }.bind(this));
        });

        it('should set width to the initial one', function(done) {
            this.box.classList.add('js-active');

            Trans.removeTransClass(this.box, 'js-active', function() {
                expect(this.box.offsetWidth).to.equal(this.initialWidth);
                done();
            }.bind(this));
        });
    });


    describe('width + display block/none', function() {
        beforeEach(function() {
            createElement.call(this, 'width-display-trans');
        });

        afterEach(function() {
            removeElement.call(this);
        });

        it('should set display property to none and width to 0px', function(done) {
            Trans.addTransClass(this.box, 'js-active', function() {
                expect(css(this.box, 'display')).to.equal('none');
                expect(css(this.box, 'width')).to.equal('0px');
                done();
            }.bind(this));
        });

        it('should set display property to block and width to original', function(done) {
            this.box.classList.add('js-active');

            Trans.removeTransClass(this.box, 'js-active', function() {
                expect(css(this.box, 'display')).to.equal('block');
                expect(css(this.box, 'width')).to.equal('200px');
                done();
            }.bind(this));
        });
    });


    describe('height auto/0 + display block/none', function() {
        beforeEach(function() {
            createElement.call(this, 'height-auto-display-trans');
            this.box.innerHTML = lipsum;
            this.initialHeight = this.box.offsetHeight;
        });

        afterEach(function() {
            removeElement.call(this);
        });

        it('should set display property to none and height to 0px', function(done) {
            Trans.addTransClass(this.box, 'js-active', function() {
                expect(css(this.box, 'display')).to.equal('none');
                expect(this.box.offsetHeight).to.equal(0);
                done();
            }.bind(this));
        });

        it('should set display property to block and height to original', function(done) {
            this.box.classList.add('js-active');

            Trans.removeTransClass(this.box, 'js-active', function() {
                expect(css(this.box, 'display')).to.equal('block');
                expect(this.box.offsetHeight).to.equal(this.initialHeight);
                done();
            }.bind(this));
        });
    });


    describe('width auto/0 + display block/none', function() {
        beforeEach(function() {
            createElement.call(this, 'width-auto-display-trans');
            this.box.innerHTML = lipsum;
            this.initialWidth = this.box.offsetWidth;
        });

        afterEach(function() {
            removeElement.call(this);
        });

        it('should set display property to none and width to 0px', function(done) {
            Trans.addTransClass(this.box, 'js-active', function() {
                expect(css(this.box, 'display')).to.equal('none');
                expect(this.box.offsetWidth).to.equal(0);
                done();
            }.bind(this));
        });

        it('should set display property to block and width to original', function(done) {
            this.box.classList.add('js-active');

            Trans.removeTransClass(this.box, 'js-active', function() {
                expect(css(this.box, 'display')).to.equal('block');
                expect(this.box.offsetWidth).to.equal(this.initialWidth);
                done();
            }.bind(this));
        });
    });

});








// describe('utilities', function() {
//     'use strict';

//     beforeEach(function() {
//         this.$box = $(box('regular-trans'));
//         $('#fixture').append(this.$box);
//     });

//     afterEach(function() {
//         this.$box.remove();
//     });

//     it('should fire callback when using `transEnd` method', function(done) {
//         this.timeout(3000);

//         this.$box.transEnd(function() {
//             done();
//         });

//         _.defer(function() {
//             this.$box.addClass('js-active');
//         }.bind(this));
//     });

//     it('should fire callback when using `transEnd` jQuery event type', function(done) {
//         this.timeout(3000);

//         this.$box.one('transEnd', function() {
//             done();
//         });

//         _.defer(function() {
//             this.$box.addClass('js-active');
//         }.bind(this));
//     });

//     it('should change attributes without transitions using `noTrans` method', function() {
//         var random_w = _.random(200, 500);
//         var random_h = _.random(200, 500);

//         // trigger repaint
//         this.$box.width();

//         this.$box.noTrans(function() {
//             this.$box.css('width', random_w);
//             this.$box.css('height', random_h);
//         }, this);

//         expect(this.$box.width()).to.equal(random_w);
//         expect(this.$box.height()).to.equal(random_h);
//     });
// });