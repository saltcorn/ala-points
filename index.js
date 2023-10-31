const {
  textarea,
  text,
  table,
  th,
  tr,
  td,
  code,
  pre,
  input,
  i,
  button,
  text_attr,
  select,
  script,
  domReady,
  option,
  span,
  nbsp,
  section,
  div,
  a,
} = require("@saltcorn/markup/tags");

const showLatLng = (v) => {
  if (!v) return "";
  const { ycoord, xcoord } = v;
  return `${Math.abs(ycoord).toFixed(4)}° ${ycoord > 0 ? "N" : "S"}, ${Math.abs(
    xcoord
  ).toFixed(4)}° ${xcoord > 0 ? "E" : "W"}`;
};

const alaPoint = {
  name: "AlaPoint",
  sql_name: "jsonb",
  fieldviews: {
    showJsonObject: {
      isEdit: false,
      run: (v) => pre({ class: "wsprewrap" }, code(JSON.stringify(v))),
    },
    showLatLng: {
      isEdit: false,
      run: showLatLng,
    },
    googleMapsLink: {
      configFields: [{ label: "Label", name: "label", type: "String" }],
      run: (v, req, options) =>
        v
          ? a(
              {
                href: `http://www.google.com/maps/place/${v.ycoord},${v.xcoord}`,
              },
              options?.label || "Google Maps Link"
            )
          : "",
    },
    searchAlaNumber: {
      isEdit: true,
      run: (nm, v, attrs, cls, required, field) =>
        div(
          { class: "input-group ala-input" },
          input({
            type: "text",
            disabled: attrs.disabled,
            readonly: attrs.readonly,
            class: ["form-control", "ala-input", cls],
            value: v?.ala_num || false,
          }),
          button(
            {
              class: "btn btn-secondary",
              type: "button",
              onClick: `lookup_by_ala_number(this, '${nm}')`,
            },
            v?.ala_num ? "Find ✓" : "Find"
          ),

          input({
            name: text_attr(nm),
            id: `input${text_attr(nm)}`,
            type: "hidden",
            onChange: attrs.onChange,
            "data-fieldname": text_attr(field.name),
            value: v ? text_attr(JSON.stringify(v)) : false,
          })
        ),
    },
  },
  attributes: [],
  read: (v, attrs) => {
    switch (typeof v) {
      case "string":
        try {
          return JSON.parse(v);
        } catch {
          return undefined;
        }
      default:
        return v;
    }
  },
};

module.exports = {
  sc_plugin_api_version: 1,
  types: [alaPoint],
  plugin_name: "ala-points",
  headers: [
    {
      script: `/plugins/public/ala-points${
        "@" + require("./package.json").version
      }/alaclient.js`,
    },
  ],
};
