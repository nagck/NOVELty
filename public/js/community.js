// When the document is ready
$(document).ready(() => {
  //this will add the rating
  $(".rating-star").each(el => {
    let location = $(`.rating-star[data-slide="${el}"]`);
    let num = location.attr('data-star')
    for (let i = 0; i < 5; i++) {
      if (i < num) location.append(`<span class='yellow-star'>★</span>`)
      else location.append(`<span class='white-star'>☆</span>`)
    }
  })
})