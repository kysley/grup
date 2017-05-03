$(() => {
  const generateItem = () => colorArray[Math.floor(Math.random()*colorArray.length)];

  const colorArray = ['#000', '#F04A50', '#06D6A0' ,'#4477FF', '#FFD166', '#91A6FF'];
  $('.post').each(function(i, obj) {
    // console.log(obj);
    $(this).css('border-color', generateItem());
    // $(this).css('box-shadow', '4px 4px' + generateItem());
  })
  try {
    $('.comment-body').each(function(i, obj) {
      // console.log(obj);
      $(this).css('border-color', generateItem());
      // $(this).css('box-shadow', '4px 4px' + generateItem());
    })
  } catch(err) {
    console.log("No comments on this page");
  }
});

