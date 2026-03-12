INTERACTIVE LATEX BOOK SYSTEM
Project structure, workflow, and collaboration rules

=====================================================================
1. OVERVIEW
=====================================================================

This repository implements an interactive textbook system based on
LaTeX sources.

The system has three main components:

1. LaTeX sources for the book and panels
2. A build step using Pandoc that converts LaTeX to HTML
3. A web interface that loads the generated HTML and displays
   interactive panels and animations

The interface shows two columns:

LEFT COLUMN
The main book text rendered from content/main.tex

RIGHT COLUMN
An expansion panel that appears when the reader clicks a highlighted
element in the main text.

Panels are written in LaTeX and compiled to HTML during the build
process.

Animations can optionally be embedded inside panels.

The overall pipeline is:

LaTeX source files
        ↓
Pandoc conversion
        ↓
Generated HTML files
        ↓
Interactive web reader


=====================================================================
2. PROJECT FOLDER STRUCTURE
=====================================================================

project_root/

  content/
      main.tex
      macros.tex

  panels/
      def41.tex
      pendulum.tex

  animations/
      pendulum/
          anim.js

  filters/
      clicks.lua

  web/
      index.html
      app.js
      panel_runtime.js

      lib/
          scene.js
          phase_portrait.js
          rk4.js
          sliders.js

  build/
      main.html
      panels/

  Makefile
  package.json


=====================================================================
3. DESCRIPTION OF EACH FOLDER
=====================================================================

------------------------------
content/
------------------------------

This folder contains the main book text.

FILE: main.tex

This file contains the primary content of the book:

- chapters
- sections
- mathematics
- clickable references to panels

Example content:

    \chapter{Lyapunov Stability}

    Consider the system

    \[
    \dot{x} = f(x)
    \]

    \click{def41}{Definition 4.1}


FILE: macros.tex

Defines project specific LaTeX commands used throughout the system.

Example definitions:

    \providecommand{\click}[2]{\href{panel:#1}{#2}}
    \providecommand{\PanelAnim}[1]{\href{anim:#1}{ }}
    \providecommand{\PanelTitle}[1]{\section*{#1}}

These commands are interpreted by the Pandoc Lua filter.


------------------------------
panels/
------------------------------

Each file in this folder corresponds to one expansion panel.

The file name must match the panel identifier.

Example:

    panels/def41.tex

Example panel content:

    \input{content/macros.tex}

    \PanelTitle{Definition 4.1}

    The equilibrium point is stable if

    \[
    \|x(0)\| < \delta \Rightarrow \|x(t)\| < \varepsilon
    \]

When the user clicks

    \click{def41}{Definition 4.1}

the web application loads

    build/panels/def41.html


------------------------------
animations/
------------------------------

Animations are optional.

Each animation has its own folder.

Example:

    animations/pendulum/anim.js

Panels request animations using

    \PanelAnim{pendulum}

The runtime loads animations dynamically.

Animations typically define a dynamical system and pass it to a
shared visualization engine located in:

    web/lib/scene.js
    web/lib/phase_portrait.js

This engine handles:

- numerical integration
- rendering the phase portrait
- background trajectories
- user-clicked trajectories
- fading trajectory trails
- parameter sliders
- zoom controls

Integration uses a fourth-order Runge–Kutta method implemented in

    web/lib/rk4.js

Animations define the system

    \dot{x} = f(x,p)

and specify parameters and domain bounds.


Example animation configuration:

    export async function mount(container){

        return mountPhaseScene(container,{

            system:(x,p)=>[
                x[1],
                -p.a*Math.sin(x[0]) - p.b*x[1]
            ],

            params:{
                a:{value:2,min:0.5,max:5,step:0.1},
                b:{value:0.4,min:0,max:2,step:0.05}
            },

            domain:{
                xmin:-Math.PI,
                xmax: Math.PI,
                ymin:-4,
                ymax: 4
            }

        })
    }

Parameter sliders are generated automatically from the `params`
configuration.


------------------------------
filters/
------------------------------

Contains the Pandoc Lua filter used during the build process.

FILE: clicks.lua

The filter converts special links into HTML elements used by the
interface.

Example conversions:

    \click{def41}{Definition}

becomes

    span element with attribute data-panel="def41"

and

    \PanelAnim{pendulum}

becomes

    div element with attribute data-anim="pendulum"


------------------------------
web/
------------------------------

Contains the web application.

FILE: index.html

Defines:

- layout
- CSS theme
- MathJax configuration
- main user interface

FILE: app.js

Responsible for:

- loading build/main.html
- attaching click handlers
- activating clickable anchors

FILE: panel_runtime.js

Responsible for:

- loading panel HTML
- rendering mathematics
- mounting animations

LIBRARY FILES

The directory

    web/lib/

contains reusable visualization components:

scene.js
    High-level animation wrapper that mounts the phase portrait and
    parameter sliders.

phase_portrait.js
    Core visualization engine that renders trajectories and handles
    user interaction.

rk4.js
    Numerical integrator used for simulating trajectories.

sliders.js
    Utility for creating parameter sliders.


------------------------------
build/
------------------------------

This directory contains generated files.

Examples:

    build/main.html
    build/panels/def41.html

These files are generated automatically during the build process and
should not be edited manually.


------------------------------
Makefile
------------------------------

Defines the build pipeline.

Example rule:

    pandoc content/main.tex → build/main.html
    pandoc panels/*.tex → build/panels/*.html


=====================================================================
4. PREREQUISITES
=====================================================================

Two tools are required.

PANDOC

Pandoc converts LaTeX files to HTML.

Example installation on Linux:

    sudo apt install pandoc

Verify installation:

    pandoc --version


PYTHON 3

Python is used to run a simple local web server.

Verify installation:

    python3 --version


OPTIONAL: NODE.JS

Node can also be used to run the development server.

Install dependencies:

    npm install

Run the server:

    npm run serve


=====================================================================
5. BUILD PROCESS
=====================================================================

From the project root run:

    make build

This performs the following conversions.

MAIN DOCUMENT

    content/main.tex
            ↓
    build/main.html


PANELS

    panels/*.tex
            ↓
    build/panels/*.html


=====================================================================
6. RUNNING THE INTERACTIVE BOOK
=====================================================================

Start a local web server:

    python3 -m http.server 8000

Then open the following address in a browser:

    http://localhost:8000/web/

A server is required because browsers block fetch() requests when
opening files directly from disk.

Alternatively, if Node is installed:

    npm run serve


=====================================================================
7. ADDING CONTENT
=====================================================================

Two workflows are supported.

---------------------------------------------------------------------
7.1 ADDING TEXT ONLY
---------------------------------------------------------------------

Edit the main document:

    content/main.tex

Example:

    \section{Example}

    The system

    \[
    \dot{x} = -x
    \]

    is asymptotically stable.

Then rebuild:

    make build

Refresh the browser.


---------------------------------------------------------------------
7.2 ADDING A NEW PANEL
---------------------------------------------------------------------

STEP 1

Insert a clickable reference in main.tex.

Example:

    \click{new_panel}{Click here}


STEP 2

Create the panel file:

    panels/new_panel.tex

Example content:

    \input{content/macros.tex}

    \PanelTitle{New Panel}

    Explanation text goes here.


STEP 3

Rebuild:

    make build

Clicking the anchor now opens the panel.


---------------------------------------------------------------------
7.3 ADDING A PANEL WITH AN ANIMATION
---------------------------------------------------------------------

STEP 1

Create the panel file:

    panels/pendulum.tex

Example:

    \input{content/macros.tex}

    \PanelTitle{Pendulum Example}

    \PanelAnim{pendulum}

    The system

    \[
    \dot{x}_1 = x_2
    \]
    \[
    \dot{x}_2 = -\sin x_1 - b x_2
    \]


STEP 2

Create the animation file:

    animations/pendulum/anim.js


Animations must export the function

    export async function mount(container)


and must return an object containing

    destroy()


STEP 3

Rebuild the project:

    make build


=====================================================================
8. PYTHON BASED ANIMATIONS
=====================================================================

Two options exist.

OPTION 1 (RECOMMENDED)

Use Python offline to generate data files.

Example:

    python generate_data.py → data.json

The animation then loads and visualizes the JSON data.


OPTION 2

Run Python in the browser using Pyodide.

This approach is slower and requires additional runtime loading.


=====================================================================
9. SUPPORTED LATEX COMMANDS
=====================================================================

Safe subset of LaTeX commands:

    \chapter
    \section
    \subsection
    \textbf
    \emph
    itemize
    enumerate
    inline math
    display math
    aligned
    cases


PROJECT SPECIFIC COMMANDS

    \click{id}{text}

    \PanelTitle{title}

    \PanelAnim{id}


=====================================================================
10. UNSUPPORTED LATEX FEATURES
=====================================================================

The system does not support arbitrary LaTeX packages.

Examples that will not work:

    tikz
    algorithm
    minted
    package specific environments

Reason:

Pandoc converts LaTeX to HTML instead of compiling LaTeX.


=====================================================================
11. SUMMARY
=====================================================================

This system provides:

- LaTeX based authoring
- modular expansion panels
- interactive animations
- lightweight web rendering

Typical workflow:

1. edit LaTeX
2. build with Pandoc
3. start local server
4. view the interactive book in the browser
