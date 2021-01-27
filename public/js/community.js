$(document).ready(() =>{
    
    console.log($(".rating-star"))
    $(".rating-star").each(el =>{
        let location = $(`.rating-star[data-slide="${el}"]`);
        let num = location.attr('data-star')
        console.log(location)
        for(let i = 0; i < 5; i++){
            if(i < num) location.append(`<span class='yellow-star'>★</span>`)
            else location.append(`<span class='white-star'>☆</span>`)
        }
    })
})