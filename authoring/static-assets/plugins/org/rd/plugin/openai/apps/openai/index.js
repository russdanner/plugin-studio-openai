const React = craftercms.libs.React;
const { useState } = craftercms.libs.React;
const { useSelector, useDispatch } = craftercms.libs.ReactRedux;
const { Tooltip, DialogContent, TextField, DialogActions, Button: Button$1, DialogContentText } = craftercms.libs.MaterialUI;
const IconButton = craftercms.libs.MaterialUI.IconButton && Object.prototype.hasOwnProperty.call(craftercms.libs.MaterialUI.IconButton, 'default') ? craftercms.libs.MaterialUI.IconButton['default'] : craftercms.libs.MaterialUI.IconButton;
const Button = craftercms.libs.MaterialUI.Button && Object.prototype.hasOwnProperty.call(craftercms.libs.MaterialUI.Button, 'default') ? craftercms.libs.MaterialUI.Button['default'] : craftercms.libs.MaterialUI.Button;
const SystemIcon = craftercms.components.SystemIcon && Object.prototype.hasOwnProperty.call(craftercms.components.SystemIcon, 'default') ? craftercms.components.SystemIcon['default'] : craftercms.components.SystemIcon;
const { createAction } = craftercms.libs.ReduxToolkit;
const { get } = craftercms.utils.ajax;
const FormControl = craftercms.libs.MaterialUI.FormControl && Object.prototype.hasOwnProperty.call(craftercms.libs.MaterialUI.FormControl, 'default') ? craftercms.libs.MaterialUI.FormControl['default'] : craftercms.libs.MaterialUI.FormControl;

/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
function useActiveSiteId() {
  return useSelector((state) => state.sites.active);
}

/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
function useEnv() {
  return useSelector((state) => state.env);
}

/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
// endregion
// region Widget Dialog
const showWidgetDialog = /*#__PURE__*/ createAction('SHOW_WIDGET_DIALOG');
// endregion

function GenerateContent(props) {
    // Note: All toolbar child components receive the current preview item as a prop automatically. If this component will be used elsewhere, use useCurrentPreviewItem() hook.
    var item = props.item, useIcon = props.useIcon;
    var dispatch = useDispatch();
    useActiveSiteId();
    useEnv();
    var label = "Generate Content"; //readonly ? 'View' : 'Edit';
    var iconId = item
        ? '@mui/icons-material/PsychologyRounded'
        : '@mui/icons-material/HourglassEmptyOutlined';
    var handleClick = function (event) {
        dispatch(showWidgetDialog({
            title: "AI Generated Content Assistant",
            extraProps: props,
            widget: {
                id: 'org.rd.plugin.openai.dialog'
            }
        }));
    };
    return useIcon ? (React.createElement(Tooltip, { title: item ? "".concat(label) : '' },
        React.createElement(IconButton, { size: "small", onClick: handleClick, disabled: !item },
            React.createElement(SystemIcon, { icon: { id: iconId } })))) : (React.createElement(Button, { size: "small", variant: "text", onClick: handleClick, disabled: !item }, label));
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function GenerateContentDialog(props) {
    var siteId = useActiveSiteId();
    var _a = useState(); _a[0]; var setError = _a[1];
    var _b = useState([]), generatedContent = _b[0], setGeneratedContent = _b[1];
    var _c = React.useState('Write a story'), ask = _c[0], setAsk = _c[1];
    var PLUGIN_SERVICE_BASE = '/studio/api/2/plugin/script/plugins/org/rd/plugin/openai/openai';
    var handleAskChange = function (event) {
        setAsk(event.target.value);
    };
    var copyResult = function () {
        alert("copy");
    };
    var handleGenerate = function () {
        var serviceUrl = "".concat(PLUGIN_SERVICE_BASE, "/gentext.json?siteId=").concat(siteId, "&ask=").concat(ask);
        get(serviceUrl).subscribe({
            next: function (response) {
                console.log(response.response.result);
                setGeneratedContent(__spreadArray([], response.response.result, true));
            },
            error: function (e) {
                var _a, _b;
                console.error(e);
                setError((_b = (_a = e.response) === null || _a === void 0 ? void 0 : _a.response) !== null && _b !== void 0 ? _b : { code: '?', message: 'Unknown Error. Check browser console.' });
            }
        });
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, null,
            React.createElement(FormControl, { margin: "normal", fullWidth: true },
                React.createElement(TextField, { defaultValue: "", id: "outlined-basic", label: "How can I help?", variant: "outlined", onChange: handleAskChange })),
            React.createElement(DialogActions, null,
                React.createElement(Button$1, { onClick: handleGenerate, variant: "outlined", sx: { mr: 1 } }, "Generate")),
            React.createElement(DialogContentText, null,
                React.createElement("ol", null, generatedContent &&
                    Object.values(generatedContent).map(function (content, contentIndex) {
                        return (React.createElement("li", null,
                            React.createElement(TextField, { sx: { "background-color": "#F8F8F8", "color": "rgb(0, 122, 255)", "width": "90%", "padding-bottom": "10px", "padding-right": "20px", mb: 2 }, value: content, multiline: true }),
                            React.createElement(Button$1, { type: "button", onClick: copyResult, variant: "outlined", sx: { mr: 1 } }, "Copy")));
                    }))))));
}

var plugin = {
    locales: undefined,
    scripts: undefined,
    stylesheets: undefined,
    id: 'org.rd.plugin.openai',
    widgets: {
        'org.rd.plugin.openai.GenerateContent': GenerateContent,
        'org.rd.plugin.openai.dialog': GenerateContentDialog
    }
};

export { GenerateContent, GenerateContentDialog, plugin as default };