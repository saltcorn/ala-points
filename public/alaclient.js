async function lookup_by_ala_number(e) {
  $(e).text("Find");
  const ala_num = $(e).closest("div.ala-input").find("input.ala-input").val();

  if (!ala_num) return;
  const url = `https://ala.skyeyepacific.com/v1/query/ala_samoa?columns=*&filter=ala_num%20%3D%20%27${ala_num}%27&limit=1`;
  const response = await fetch(url);
  const aladata = await response.json();
  if (aladata?.length) {
    $(e).text("Find ✓");
    $(e)
      .closest("div.ala-input")
      .find("input[type=hidden]")
      .val(JSON.stringify(aladata[0]));
  }
}

const lookup_by_map_click = (map, curMarkers) => async (e) => {
  const {
    latlng: { lat, lng },
  } = e;
  //https://ala.skyeyepacific.com/v1/nearest/ala_samoa/-171.7761%2C-13.84322%2C4326?geom_column=geom&columns=*&limit=1
  //console.log("add point", { lat, lng });
  const url = `https://ala.skyeyepacific.com/v1/nearest/ala_samoa/${lng}%2C${lat}%2C4326?geom_column=geom&columns=*&limit=1`;
  const response = await fetch(url);
  const aladata = await response.json();
  if (aladata?.length) {
    $(e.originalEvent.target)
      .closest("div.ala-input")
      .find("input[type=hidden]")
      .val(JSON.stringify(aladata[0]));
    if (curMarkers.length)
      curMarkers.forEach((m) => {
        map.removeLayer(m);
      });
    const m = L.marker([lat, lng]).addTo(map);
    curMarkers.push(m);
    const disp_loc = $(e.originalEvent.target)
      .closest("div.ala-input")
      .find("div.display-ala-location");
    disp_loc.html(ala_point_to_html(aladata[0]));
  }
};

function preventAlaSubmit(event, curMarkers, map) {
  if (event.keyCode == 13) {
    event.preventDefault();
    setTimeout(() => {
      search_by_ala_name(event, curMarkers, map);
    });
    return false;
  }
}

let ala_cache = {};
let ala_fetching;
let ala_last_fetch;

async function search_by_ala_name(e, curMarkers, map) {
  e.preventDefault();
  const container = $(e.target)
    .closest("div.ala-input")
    .find("div.byname-results");
  const val = e.target.value;
  //console.log("ala name", { e, val, curMarkers, map });
  if (!val) return;

  let isAlaNumber = false;

  if (val.match(/^[0-9]{1,3}-[0-9]{1,3}-[0-9]{1,3}$/)) isAlaNumber = true;

  //same query, container open -> ignore
  if (ala_last_fetch === val && $.trim(container.html())) return;
  let aladata;
  if (ala_cache[val]) aladata = ala_cache[val];
  else {
    if (val === ala_fetching) return;
    ala_last_fetch = val;
    ala_fetching = val;

    let url;
    if (isAlaNumber) {
      url = `https://ala.skyeyepacific.com/v1/query/ala_samoa?columns=*&filter=ala_num%20%3D%20%27${val}%27&limit=1`;
    } else {
      const filter = encodeURIComponent(`name ilike '%${val}%'`);
      url = `https://ala.skyeyepacific.com/v1/query/ala_samoa?columns=*&filter=${filter}&limit=20`;
    }
    container.html(`<i>Loading...</i>`);
    const response = await fetch(url);
    aladata = await response.json();
    ala_fetching = null;
  }
  const set_ala_pt = (alapt) => {
    $(e.target)
      .closest("div.ala-input")
      .find("input[type=hidden]")
      .val(JSON.stringify(alapt));
    if (curMarkers.length)
      curMarkers.forEach((m) => {
        map.removeLayer(m);
      });
    const m = L.marker([+alapt.ycoord, +alapt.xcoord]).addTo(map);
    curMarkers.push(m);
    container.empty(); //clear
    $(e.target).val(alapt.name);
    const disp_loc = $(e.target)
      .closest("div.ala-input")
      .find("div.display-ala-location");
    disp_loc.html(ala_point_to_html(alapt));
  };
  if (aladata?.length === 1) {
    set_ala_pt(aladata[0]);
  } else if (aladata?.length) {
    container.empty(); //clear
    for (const alapt of aladata) {
      const newelem = $(ala_point_to_html(alapt, true));
      newelem.on("click", () => {
        set_ala_pt(alapt);
      });
      container.append(newelem);
    }
    //console.log("ala data", aladata[0]);
  }
}

function ala_point_to_html(alapt, point) {
  return `<div class="border p-2" ${point ? 'style="cursor: pointer;"' : ""}>${
    alapt.name || ""
  }${
    alapt.name ? "<br>" : ""
  }<div class="d-flex justify-content-between"><small>${
    alapt.village || ""
  }</small><small>Ala number ${alapt.ala_num}</small></div></div>`;
}
