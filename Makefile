JSLINT_FILES = $(wildcard *.js **/*.js)
JSLINT_OPTIONS = --sloppy
JSLINT_GLOBALS = --predef $$ --predef angular --predef Utilities --predef Schedule --predef describe --predef it --predef expect --predef beforeEach --predef afterEach

lint:
	jslint $(JSLINT_OPTIONS) $(JSLINT_GLOBALS) $(JSLINT_FILES)
