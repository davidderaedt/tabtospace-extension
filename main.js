/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** extension to replace tabs with spaces and vice versa */
define(function (require, exports, module) {
    'use strict';

    var CommandManager  = brackets.getModule("command/CommandManager"),
        EditorManager   = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        Menus           = brackets.getModule("command/Menus");


    var TAB2S_COMMAND   = "tabtospace.tabtospace";
    var S2TAB_COMMAND   = "tabtospace.spacetotab";
    var TAB2S_MENU_NAME = "Convert indentation to spaces";
    var S2TAB_MENU_NAME = "Convert indentation to tabs";

    
    // TODO use the actual tab width (space count) used by the editor
    var defaultTabWidth    = 4;
    var indentationMatcher = /^[ \t]+/gm;


    function replaceInDocument(re, textOrFunc) {
        var txt = DocumentManager.getCurrentDocument().getText();
        var txt2 = txt.replace(re, textOrFunc);
        DocumentManager.getCurrentDocument().setText(txt2);
    }

    
    function lengthOfIndentation(string, tabWidth) {
        var length = 0;
        
        for (var i = 0; i < string.length; i++) {
            var c = string.charAt(i);
            if (c === '\t') {
                length += (tabWidth - (length % tabWidth));
            } else {
                length += 1;
            }
        }

        return length;
    }

    function testLengthOfIndentation() {
        var tabWidth = 4;

        console.assert(0            === lengthOfIndentation("",       tabWidth));
        console.assert(tabWidth     === lengthOfIndentation("\t",     tabWidth));
        
        console.assert(1            === lengthOfIndentation(" ",      tabWidth));
        console.assert(2            === lengthOfIndentation("  ",     tabWidth));
        console.assert(3            === lengthOfIndentation("   ",    tabWidth));
        console.assert(4            === lengthOfIndentation("    ",   tabWidth));
        
        console.assert(tabWidth + 1 === lengthOfIndentation("\t ",    tabWidth));
        console.assert(tabWidth + 2 === lengthOfIndentation("\t  ",   tabWidth));
        console.assert(tabWidth + 3 === lengthOfIndentation("\t   ",  tabWidth));
        console.assert(tabWidth + 4 === lengthOfIndentation("\t    ", tabWidth));
        
        console.assert(tabWidth     === lengthOfIndentation(" \t",    tabWidth));
        console.assert(tabWidth     === lengthOfIndentation("  \t",   tabWidth));
        console.assert(tabWidth     === lengthOfIndentation("   \t",  tabWidth));
        console.assert(tabWidth + 4 === lengthOfIndentation("    \t", tabWidth));
    }


    function indentationWithLength(length, tabWidth) {
        var indentation = "";
        
        // Use tabs if tabWidth is not undefined, null or 0
        if (tabWidth) {
            while (length >= tabWidth) {
                indentation += "\t";
                length -= tabWidth;
            }
        }
        
        while (length > 0) {
            indentation += " ";
            length -= 1;
        }
        
        return indentation;
    }

    function testIndentationWithLength() {
        var tabWidth = 4;
        
        for (var i = 0; i < 8; i++) {
            console.assert(i === lengthOfIndentation(indentationWithLength(i, tabWidth), tabWidth));
            console.assert(i === lengthOfIndentation(indentationWithLength(i),           tabWidth));
        }
    }
    
    
    function tabToSpaceReplacer(indentation) {
        var length = lengthOfIndentation(indentation, defaultTabWidth);
        return indentationWithLength(length);
    }

    function tabToSpace() {
        replaceInDocument(indentationMatcher, tabToSpaceReplacer);
    }


    function spaceToTabReplacer(indentation) {
        var length = lengthOfIndentation(indentation, defaultTabWidth);
        return indentationWithLength(length, defaultTabWidth);
    }
    
    function spaceToTab() {
        replaceInDocument(indentationMatcher, spaceToTabReplacer);
    }


    CommandManager.register(TAB2S_MENU_NAME, TAB2S_COMMAND, tabToSpace);
    CommandManager.register(S2TAB_MENU_NAME, S2TAB_COMMAND, spaceToTab);

    var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
    menu.addMenuDivider();
    menu.addMenuItem(TAB2S_COMMAND);
    menu.addMenuItem(S2TAB_COMMAND);

    testLengthOfIndentation();
    testIndentationWithLength();
});