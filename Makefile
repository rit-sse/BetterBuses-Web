JSLINT_FILES = $(wildcard *.js **/*.js)
JSLINT_OPTIONS = --sloppy
JSLINT_GLOBALS = --predef $$ --predef Routes

lint:
	jslint $(JSLINT_OPTIONS) $(JSLINT_GLOBALS) $(JSLINT_FILES)
