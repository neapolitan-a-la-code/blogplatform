test:
	@node node_modules/lab/bin/lab

test-cov:
	@node node_modules/lab/bin/lab -t 100
	
test-cov-html:
	@node node_modules/lab/bin/lab -r html -o coverage.html

.PHONY: test test-cov test-cov-html

INPUT = ./public/css/main.scss
OUTPUT = ./public/css/main.css

sass watch:
	sass --watch \
	$(INPUT):$(OUTPUT) \
	--style expanded \

sass production:
	sass --update \
	$(INPUT):$(OUTPUT) \
	--style compressed \

.PHONY: sass watch sass production