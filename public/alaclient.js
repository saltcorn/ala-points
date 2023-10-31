async function lookup_by_ala_number(e, nm) {
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
