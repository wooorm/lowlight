import {lowlight} from './lib/core.js'
import $1c from 'highlight.js/lib/languages/1c.js'
import abnf from 'highlight.js/lib/languages/abnf.js'
import accesslog from 'highlight.js/lib/languages/accesslog.js'
import actionscript from 'highlight.js/lib/languages/actionscript.js'
import ada from 'highlight.js/lib/languages/ada.js'
import angelscript from 'highlight.js/lib/languages/angelscript.js'
import apache from 'highlight.js/lib/languages/apache.js'
import applescript from 'highlight.js/lib/languages/applescript.js'
import arcade from 'highlight.js/lib/languages/arcade.js'
import arduino from 'highlight.js/lib/languages/arduino.js'
import armasm from 'highlight.js/lib/languages/armasm.js'
import xml from 'highlight.js/lib/languages/xml.js'
import asciidoc from 'highlight.js/lib/languages/asciidoc.js'
import aspectj from 'highlight.js/lib/languages/aspectj.js'
import autohotkey from 'highlight.js/lib/languages/autohotkey.js'
import autoit from 'highlight.js/lib/languages/autoit.js'
import avrasm from 'highlight.js/lib/languages/avrasm.js'
import awk from 'highlight.js/lib/languages/awk.js'
import axapta from 'highlight.js/lib/languages/axapta.js'
import bash from 'highlight.js/lib/languages/bash.js'
import basic from 'highlight.js/lib/languages/basic.js'
import bnf from 'highlight.js/lib/languages/bnf.js'
import brainfuck from 'highlight.js/lib/languages/brainfuck.js'
import c from 'highlight.js/lib/languages/c.js'
import cal from 'highlight.js/lib/languages/cal.js'
import capnproto from 'highlight.js/lib/languages/capnproto.js'
import ceylon from 'highlight.js/lib/languages/ceylon.js'
import clean from 'highlight.js/lib/languages/clean.js'
import clojure from 'highlight.js/lib/languages/clojure.js'
import clojureRepl from 'highlight.js/lib/languages/clojure-repl.js'
import cmake from 'highlight.js/lib/languages/cmake.js'
import coffeescript from 'highlight.js/lib/languages/coffeescript.js'
import coq from 'highlight.js/lib/languages/coq.js'
import cos from 'highlight.js/lib/languages/cos.js'
import cpp from 'highlight.js/lib/languages/cpp.js'
import crmsh from 'highlight.js/lib/languages/crmsh.js'
import crystal from 'highlight.js/lib/languages/crystal.js'
import csharp from 'highlight.js/lib/languages/csharp.js'
import csp from 'highlight.js/lib/languages/csp.js'
import css from 'highlight.js/lib/languages/css.js'
import d from 'highlight.js/lib/languages/d.js'
import markdown from 'highlight.js/lib/languages/markdown.js'
import dart from 'highlight.js/lib/languages/dart.js'
import delphi from 'highlight.js/lib/languages/delphi.js'
import diff from 'highlight.js/lib/languages/diff.js'
import django from 'highlight.js/lib/languages/django.js'
import dns from 'highlight.js/lib/languages/dns.js'
import dockerfile from 'highlight.js/lib/languages/dockerfile.js'
import dos from 'highlight.js/lib/languages/dos.js'
import dsconfig from 'highlight.js/lib/languages/dsconfig.js'
import dts from 'highlight.js/lib/languages/dts.js'
import dust from 'highlight.js/lib/languages/dust.js'
import ebnf from 'highlight.js/lib/languages/ebnf.js'
import elixir from 'highlight.js/lib/languages/elixir.js'
import elm from 'highlight.js/lib/languages/elm.js'
import ruby from 'highlight.js/lib/languages/ruby.js'
import erb from 'highlight.js/lib/languages/erb.js'
import erlangRepl from 'highlight.js/lib/languages/erlang-repl.js'
import erlang from 'highlight.js/lib/languages/erlang.js'
import excel from 'highlight.js/lib/languages/excel.js'
import fix from 'highlight.js/lib/languages/fix.js'
import flix from 'highlight.js/lib/languages/flix.js'
import fortran from 'highlight.js/lib/languages/fortran.js'
import fsharp from 'highlight.js/lib/languages/fsharp.js'
import gams from 'highlight.js/lib/languages/gams.js'
import gauss from 'highlight.js/lib/languages/gauss.js'
import gcode from 'highlight.js/lib/languages/gcode.js'
import gherkin from 'highlight.js/lib/languages/gherkin.js'
import glsl from 'highlight.js/lib/languages/glsl.js'
import gml from 'highlight.js/lib/languages/gml.js'
import go from 'highlight.js/lib/languages/go.js'
import golo from 'highlight.js/lib/languages/golo.js'
import gradle from 'highlight.js/lib/languages/gradle.js'
import groovy from 'highlight.js/lib/languages/groovy.js'
import haml from 'highlight.js/lib/languages/haml.js'
import handlebars from 'highlight.js/lib/languages/handlebars.js'
import haskell from 'highlight.js/lib/languages/haskell.js'
import haxe from 'highlight.js/lib/languages/haxe.js'
import hsp from 'highlight.js/lib/languages/hsp.js'
import http from 'highlight.js/lib/languages/http.js'
import hy from 'highlight.js/lib/languages/hy.js'
import inform7 from 'highlight.js/lib/languages/inform7.js'
import ini from 'highlight.js/lib/languages/ini.js'
import irpf90 from 'highlight.js/lib/languages/irpf90.js'
import isbl from 'highlight.js/lib/languages/isbl.js'
import java from 'highlight.js/lib/languages/java.js'
import javascript from 'highlight.js/lib/languages/javascript.js'
import jbossCli from 'highlight.js/lib/languages/jboss-cli.js'
import json from 'highlight.js/lib/languages/json.js'
import julia from 'highlight.js/lib/languages/julia.js'
import juliaRepl from 'highlight.js/lib/languages/julia-repl.js'
import kotlin from 'highlight.js/lib/languages/kotlin.js'
import lasso from 'highlight.js/lib/languages/lasso.js'
import latex from 'highlight.js/lib/languages/latex.js'
import ldif from 'highlight.js/lib/languages/ldif.js'
import leaf from 'highlight.js/lib/languages/leaf.js'
import less from 'highlight.js/lib/languages/less.js'
import lisp from 'highlight.js/lib/languages/lisp.js'
import livecodeserver from 'highlight.js/lib/languages/livecodeserver.js'
import livescript from 'highlight.js/lib/languages/livescript.js'
import llvm from 'highlight.js/lib/languages/llvm.js'
import lsl from 'highlight.js/lib/languages/lsl.js'
import lua from 'highlight.js/lib/languages/lua.js'
import makefile from 'highlight.js/lib/languages/makefile.js'
import mathematica from 'highlight.js/lib/languages/mathematica.js'
import matlab from 'highlight.js/lib/languages/matlab.js'
import maxima from 'highlight.js/lib/languages/maxima.js'
import mel from 'highlight.js/lib/languages/mel.js'
import mercury from 'highlight.js/lib/languages/mercury.js'
import mipsasm from 'highlight.js/lib/languages/mipsasm.js'
import mizar from 'highlight.js/lib/languages/mizar.js'
import perl from 'highlight.js/lib/languages/perl.js'
import mojolicious from 'highlight.js/lib/languages/mojolicious.js'
import monkey from 'highlight.js/lib/languages/monkey.js'
import moonscript from 'highlight.js/lib/languages/moonscript.js'
import n1ql from 'highlight.js/lib/languages/n1ql.js'
import nginx from 'highlight.js/lib/languages/nginx.js'
import nim from 'highlight.js/lib/languages/nim.js'
import nix from 'highlight.js/lib/languages/nix.js'
import nodeRepl from 'highlight.js/lib/languages/node-repl.js'
import nsis from 'highlight.js/lib/languages/nsis.js'
import objectivec from 'highlight.js/lib/languages/objectivec.js'
import ocaml from 'highlight.js/lib/languages/ocaml.js'
import openscad from 'highlight.js/lib/languages/openscad.js'
import oxygene from 'highlight.js/lib/languages/oxygene.js'
import parser3 from 'highlight.js/lib/languages/parser3.js'
import pf from 'highlight.js/lib/languages/pf.js'
import pgsql from 'highlight.js/lib/languages/pgsql.js'
import php from 'highlight.js/lib/languages/php.js'
import phpTemplate from 'highlight.js/lib/languages/php-template.js'
import plaintext from 'highlight.js/lib/languages/plaintext.js'
import pony from 'highlight.js/lib/languages/pony.js'
import powershell from 'highlight.js/lib/languages/powershell.js'
import processing from 'highlight.js/lib/languages/processing.js'
import profile from 'highlight.js/lib/languages/profile.js'
import prolog from 'highlight.js/lib/languages/prolog.js'
import properties from 'highlight.js/lib/languages/properties.js'
import protobuf from 'highlight.js/lib/languages/protobuf.js'
import puppet from 'highlight.js/lib/languages/puppet.js'
import purebasic from 'highlight.js/lib/languages/purebasic.js'
import python from 'highlight.js/lib/languages/python.js'
import pythonRepl from 'highlight.js/lib/languages/python-repl.js'
import q from 'highlight.js/lib/languages/q.js'
import qml from 'highlight.js/lib/languages/qml.js'
import r from 'highlight.js/lib/languages/r.js'
import reasonml from 'highlight.js/lib/languages/reasonml.js'
import rib from 'highlight.js/lib/languages/rib.js'
import roboconf from 'highlight.js/lib/languages/roboconf.js'
import routeros from 'highlight.js/lib/languages/routeros.js'
import rsl from 'highlight.js/lib/languages/rsl.js'
import ruleslanguage from 'highlight.js/lib/languages/ruleslanguage.js'
import rust from 'highlight.js/lib/languages/rust.js'
import sas from 'highlight.js/lib/languages/sas.js'
import scala from 'highlight.js/lib/languages/scala.js'
import scheme from 'highlight.js/lib/languages/scheme.js'
import scilab from 'highlight.js/lib/languages/scilab.js'
import scss from 'highlight.js/lib/languages/scss.js'
import shell from 'highlight.js/lib/languages/shell.js'
import smali from 'highlight.js/lib/languages/smali.js'
import smalltalk from 'highlight.js/lib/languages/smalltalk.js'
import sml from 'highlight.js/lib/languages/sml.js'
import sqf from 'highlight.js/lib/languages/sqf.js'
import sql from 'highlight.js/lib/languages/sql.js'
import stan from 'highlight.js/lib/languages/stan.js'
import stata from 'highlight.js/lib/languages/stata.js'
import step21 from 'highlight.js/lib/languages/step21.js'
import stylus from 'highlight.js/lib/languages/stylus.js'
import subunit from 'highlight.js/lib/languages/subunit.js'
import swift from 'highlight.js/lib/languages/swift.js'
import taggerscript from 'highlight.js/lib/languages/taggerscript.js'
import yaml from 'highlight.js/lib/languages/yaml.js'
import tap from 'highlight.js/lib/languages/tap.js'
import tcl from 'highlight.js/lib/languages/tcl.js'
import thrift from 'highlight.js/lib/languages/thrift.js'
import tp from 'highlight.js/lib/languages/tp.js'
import twig from 'highlight.js/lib/languages/twig.js'
import typescript from 'highlight.js/lib/languages/typescript.js'
import vala from 'highlight.js/lib/languages/vala.js'
import vbnet from 'highlight.js/lib/languages/vbnet.js'
import vbscript from 'highlight.js/lib/languages/vbscript.js'
import vbscriptHtml from 'highlight.js/lib/languages/vbscript-html.js'
import verilog from 'highlight.js/lib/languages/verilog.js'
import vhdl from 'highlight.js/lib/languages/vhdl.js'
import vim from 'highlight.js/lib/languages/vim.js'
import x86asm from 'highlight.js/lib/languages/x86asm.js'
import xl from 'highlight.js/lib/languages/xl.js'
import xquery from 'highlight.js/lib/languages/xquery.js'
import zephir from 'highlight.js/lib/languages/zephir.js'
export {lowlight}
lowlight.registerLanguage('1c', $1c)
lowlight.registerLanguage('abnf', abnf)
lowlight.registerLanguage('accesslog', accesslog)
lowlight.registerLanguage('actionscript', actionscript)
lowlight.registerLanguage('ada', ada)
lowlight.registerLanguage('angelscript', angelscript)
lowlight.registerLanguage('apache', apache)
lowlight.registerLanguage('applescript', applescript)
lowlight.registerLanguage('arcade', arcade)
lowlight.registerLanguage('arduino', arduino)
lowlight.registerLanguage('armasm', armasm)
lowlight.registerLanguage('xml', xml)
lowlight.registerLanguage('asciidoc', asciidoc)
lowlight.registerLanguage('aspectj', aspectj)
lowlight.registerLanguage('autohotkey', autohotkey)
lowlight.registerLanguage('autoit', autoit)
lowlight.registerLanguage('avrasm', avrasm)
lowlight.registerLanguage('awk', awk)
lowlight.registerLanguage('axapta', axapta)
lowlight.registerLanguage('bash', bash)
lowlight.registerLanguage('basic', basic)
lowlight.registerLanguage('bnf', bnf)
lowlight.registerLanguage('brainfuck', brainfuck)
lowlight.registerLanguage('c', c)
lowlight.registerLanguage('cal', cal)
lowlight.registerLanguage('capnproto', capnproto)
lowlight.registerLanguage('ceylon', ceylon)
lowlight.registerLanguage('clean', clean)
lowlight.registerLanguage('clojure', clojure)
lowlight.registerLanguage('clojure-repl', clojureRepl)
lowlight.registerLanguage('cmake', cmake)
lowlight.registerLanguage('coffeescript', coffeescript)
lowlight.registerLanguage('coq', coq)
lowlight.registerLanguage('cos', cos)
lowlight.registerLanguage('cpp', cpp)
lowlight.registerLanguage('crmsh', crmsh)
lowlight.registerLanguage('crystal', crystal)
lowlight.registerLanguage('csharp', csharp)
lowlight.registerLanguage('csp', csp)
lowlight.registerLanguage('css', css)
lowlight.registerLanguage('d', d)
lowlight.registerLanguage('markdown', markdown)
lowlight.registerLanguage('dart', dart)
lowlight.registerLanguage('delphi', delphi)
lowlight.registerLanguage('diff', diff)
lowlight.registerLanguage('django', django)
lowlight.registerLanguage('dns', dns)
lowlight.registerLanguage('dockerfile', dockerfile)
lowlight.registerLanguage('dos', dos)
lowlight.registerLanguage('dsconfig', dsconfig)
lowlight.registerLanguage('dts', dts)
lowlight.registerLanguage('dust', dust)
lowlight.registerLanguage('ebnf', ebnf)
lowlight.registerLanguage('elixir', elixir)
lowlight.registerLanguage('elm', elm)
lowlight.registerLanguage('ruby', ruby)
lowlight.registerLanguage('erb', erb)
lowlight.registerLanguage('erlang-repl', erlangRepl)
lowlight.registerLanguage('erlang', erlang)
lowlight.registerLanguage('excel', excel)
lowlight.registerLanguage('fix', fix)
lowlight.registerLanguage('flix', flix)
lowlight.registerLanguage('fortran', fortran)
lowlight.registerLanguage('fsharp', fsharp)
lowlight.registerLanguage('gams', gams)
lowlight.registerLanguage('gauss', gauss)
lowlight.registerLanguage('gcode', gcode)
lowlight.registerLanguage('gherkin', gherkin)
lowlight.registerLanguage('glsl', glsl)
lowlight.registerLanguage('gml', gml)
lowlight.registerLanguage('go', go)
lowlight.registerLanguage('golo', golo)
lowlight.registerLanguage('gradle', gradle)
lowlight.registerLanguage('groovy', groovy)
lowlight.registerLanguage('haml', haml)
lowlight.registerLanguage('handlebars', handlebars)
lowlight.registerLanguage('haskell', haskell)
lowlight.registerLanguage('haxe', haxe)
lowlight.registerLanguage('hsp', hsp)
lowlight.registerLanguage('http', http)
lowlight.registerLanguage('hy', hy)
lowlight.registerLanguage('inform7', inform7)
lowlight.registerLanguage('ini', ini)
lowlight.registerLanguage('irpf90', irpf90)
lowlight.registerLanguage('isbl', isbl)
lowlight.registerLanguage('java', java)
lowlight.registerLanguage('javascript', javascript)
lowlight.registerLanguage('jboss-cli', jbossCli)
lowlight.registerLanguage('json', json)
lowlight.registerLanguage('julia', julia)
lowlight.registerLanguage('julia-repl', juliaRepl)
lowlight.registerLanguage('kotlin', kotlin)
lowlight.registerLanguage('lasso', lasso)
lowlight.registerLanguage('latex', latex)
lowlight.registerLanguage('ldif', ldif)
lowlight.registerLanguage('leaf', leaf)
lowlight.registerLanguage('less', less)
lowlight.registerLanguage('lisp', lisp)
lowlight.registerLanguage('livecodeserver', livecodeserver)
lowlight.registerLanguage('livescript', livescript)
lowlight.registerLanguage('llvm', llvm)
lowlight.registerLanguage('lsl', lsl)
lowlight.registerLanguage('lua', lua)
lowlight.registerLanguage('makefile', makefile)
lowlight.registerLanguage('mathematica', mathematica)
lowlight.registerLanguage('matlab', matlab)
lowlight.registerLanguage('maxima', maxima)
lowlight.registerLanguage('mel', mel)
lowlight.registerLanguage('mercury', mercury)
lowlight.registerLanguage('mipsasm', mipsasm)
lowlight.registerLanguage('mizar', mizar)
lowlight.registerLanguage('perl', perl)
lowlight.registerLanguage('mojolicious', mojolicious)
lowlight.registerLanguage('monkey', monkey)
lowlight.registerLanguage('moonscript', moonscript)
lowlight.registerLanguage('n1ql', n1ql)
lowlight.registerLanguage('nginx', nginx)
lowlight.registerLanguage('nim', nim)
lowlight.registerLanguage('nix', nix)
lowlight.registerLanguage('node-repl', nodeRepl)
lowlight.registerLanguage('nsis', nsis)
lowlight.registerLanguage('objectivec', objectivec)
lowlight.registerLanguage('ocaml', ocaml)
lowlight.registerLanguage('openscad', openscad)
lowlight.registerLanguage('oxygene', oxygene)
lowlight.registerLanguage('parser3', parser3)
lowlight.registerLanguage('pf', pf)
lowlight.registerLanguage('pgsql', pgsql)
lowlight.registerLanguage('php', php)
lowlight.registerLanguage('php-template', phpTemplate)
lowlight.registerLanguage('plaintext', plaintext)
lowlight.registerLanguage('pony', pony)
lowlight.registerLanguage('powershell', powershell)
lowlight.registerLanguage('processing', processing)
lowlight.registerLanguage('profile', profile)
lowlight.registerLanguage('prolog', prolog)
lowlight.registerLanguage('properties', properties)
lowlight.registerLanguage('protobuf', protobuf)
lowlight.registerLanguage('puppet', puppet)
lowlight.registerLanguage('purebasic', purebasic)
lowlight.registerLanguage('python', python)
lowlight.registerLanguage('python-repl', pythonRepl)
lowlight.registerLanguage('q', q)
lowlight.registerLanguage('qml', qml)
lowlight.registerLanguage('r', r)
lowlight.registerLanguage('reasonml', reasonml)
lowlight.registerLanguage('rib', rib)
lowlight.registerLanguage('roboconf', roboconf)
lowlight.registerLanguage('routeros', routeros)
lowlight.registerLanguage('rsl', rsl)
lowlight.registerLanguage('ruleslanguage', ruleslanguage)
lowlight.registerLanguage('rust', rust)
lowlight.registerLanguage('sas', sas)
lowlight.registerLanguage('scala', scala)
lowlight.registerLanguage('scheme', scheme)
lowlight.registerLanguage('scilab', scilab)
lowlight.registerLanguage('scss', scss)
lowlight.registerLanguage('shell', shell)
lowlight.registerLanguage('smali', smali)
lowlight.registerLanguage('smalltalk', smalltalk)
lowlight.registerLanguage('sml', sml)
lowlight.registerLanguage('sqf', sqf)
lowlight.registerLanguage('sql', sql)
lowlight.registerLanguage('stan', stan)
lowlight.registerLanguage('stata', stata)
lowlight.registerLanguage('step21', step21)
lowlight.registerLanguage('stylus', stylus)
lowlight.registerLanguage('subunit', subunit)
lowlight.registerLanguage('swift', swift)
lowlight.registerLanguage('taggerscript', taggerscript)
lowlight.registerLanguage('yaml', yaml)
lowlight.registerLanguage('tap', tap)
lowlight.registerLanguage('tcl', tcl)
lowlight.registerLanguage('thrift', thrift)
lowlight.registerLanguage('tp', tp)
lowlight.registerLanguage('twig', twig)
lowlight.registerLanguage('typescript', typescript)
lowlight.registerLanguage('vala', vala)
lowlight.registerLanguage('vbnet', vbnet)
lowlight.registerLanguage('vbscript', vbscript)
lowlight.registerLanguage('vbscript-html', vbscriptHtml)
lowlight.registerLanguage('verilog', verilog)
lowlight.registerLanguage('vhdl', vhdl)
lowlight.registerLanguage('vim', vim)
lowlight.registerLanguage('x86asm', x86asm)
lowlight.registerLanguage('xl', xl)
lowlight.registerLanguage('xquery', xquery)
lowlight.registerLanguage('zephir', zephir)
