async function lookup_by_ala_number(e) {
  $(e).text("Find");
  const ala_num = $(e).closest("div.ala-input").find("input.ala-input").val();

  console.log({ ala_num });
  if (!ala_num) return;
  const url = `http://www.saili.ws/v1/query/ala_samoa?columns=*&filter=ala_num%20%3D%20%27${ala_num}%27&limit=1`;
  const response = await fetch(url);
  const aladata = await response.json();
  console.log({ aladata });
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
  console.log(e);
  //http://www.saili.ws/v1/nearest/ala_samoa/-171.7761%2C-13.84322%2C4326?geom_column=geom&columns=*&limit=1

  const url = `http://www.saili.ws/v1/nearest/ala_samoa/${lng}%2C${lat}%2C4326?geom_column=geom&columns=*&limit=1`;
  const response = await fetch(url);
  const aladata = await response.json();
  console.log({ aladata });
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
