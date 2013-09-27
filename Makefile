JSLINT_FILES = $(wildcard *.js **/*.js)

lint:
	jslint $(JSLINT_FILES)
