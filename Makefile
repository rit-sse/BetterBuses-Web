JSLINT_FILES = $(wildcard *.js **/*.js)
JSLINT_OPTIONS = --white --sloppy --nomen
JSLINT_GLOBALS = --predef _ --predef Routes

lint:
	jslint $(JSLINT_OPTIONS) $(JSLINT_GLOBALS) $(JSLINT_FILES)
