PANDOC=pandoc
FILTER=filters/clicks.lua

build:
	mkdir -p build/panels
	$(PANDOC) content/main.tex --from=latex --to=html --lua-filter=$(FILTER) --mathjax -o build/main.html
	for f in panels/*.tex ; do \
	  b=$$(basename $$f .tex) ; \
	  $(PANDOC) $$f --from=latex --to=html --lua-filter=$(FILTER) --mathjax -o build/panels/$$b.html ; \
	done

clean:
	rm -rf build

rebuild: clean build
