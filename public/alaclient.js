async function lookup_by_ala_number(e) {
  $(e).text("Find");
  const ala_num = $(e).closest("div.ala-input").find("input.ala-input").val();

  if (!ala_num) return;
  const url = `http://www.saili.ws/v1/query/ala_samoa?columns=*&filter=ala_num%20%3D%20%27${ala_num}%27&limit=1`;
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
  //http://www.saili.ws/v1/nearest/ala_samoa/-171.7761%2C-13.84322%2C4326?geom_column=geom&columns=*&limit=1
  //console.log("add point", { lat, lng });
  const url = `http://www.saili.ws/v1/nearest/ala_samoa/${lng}%2C${lat}%2C4326?geom_column=geom&columns=*&limit=1`;
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

  //same query, container open -> ignore
  if (ala_last_fetch === val && $.trim(container.html())) return;
  let aladata;
  if (ala_cache[val]) aladata = ala_cache[val];
  else {
    const filter = encodeURIComponent(`name ilike '%${val}%'`);
    if (filter === ala_fetching) return;

    ala_last_fetch = val;
    const url = `http://www.saili.ws/v1/query/ala_samoa?columns=*&filter=${filter}&limit=20`;
    ala_fetching = filter;
    const response = await fetch(url);
    aladata = await response.json();
    ala_fetching = null;
  }
  if (aladata?.length) {
    container.empty(); //clear
    for (const alapt of aladata) {
      const newelem = $(
        `<div class="border" style="cursor: pointer;">${alapt.name}<br><small>${
          alapt.village || ""
        }</small><small class="float-right">Ala number ${
          alapt.ala_num
        }</small></div>`
      );
      newelem.on("click", () => {
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
      });
      container.append(newelem);
    }
    //console.log("ala data", aladata[0]);
  }
}
