$(document).ready(function() {
    

    getRecommendation(recommendationISBN =>{
        
        console.log(recommendationISBN)
        for(let i = 0; i <recommendationISBN.length; i++){
            
            let img = $("<img>").attr("src",getBookCover(recommendationISBN[i]));
            img.attr("data-isbn",recommendationISBN[i]);
            let li = $("<li>");
            li.append(img);
            $("#lightSlider-recommendation").append(li)
            console.log(li)
        }
        $("#lightSlider-recommendation").lightSlider(
            {
            item:3,
            // autoWidth:true,
            slideMove:1,
            easing: 'cubic-bezier(0.25, 0, 0.25, 1)',
            speed:600,
            enableDrag:false,
            responsive : []
        }); 
        
        $("#recommendation-placeholder").addClass('hide');
        $("#lightSlider-recommendation").removeClass('hide');
    });

    $("#lightSlider-recommendation").click(e =>{
        e.preventDefault();
        e.stopPropagation();
        if(e.target.matches("img")){
            console.log($(e.target).attr("data-isbn"))
            getBookInfo($(e.target).attr("data-isbn"), data=>{
                console.log(data)
    
                $("#modal-new-book").attr("data-isbn", $(e.target).attr("data-isbn"))
                $("#book-cover").html(`<img src='${getBookCover($(e.target).attr("data-isbn"))}'>`)
                $("#book-title").text(data.title)
                $("#book-author").text(data.author)
                $("#book-page").text(data.pageCount)
                $("#book-description").text(data.description)
                
                $("#book-review").html("");
                data.reviews.forEach(el =>{
                    $("#book-review").append(`<p>Rating: ${el.rating}</p><p>${el.content}</p><p>-${el.User.username}</p>`)
                })
    
                $("#modal-new-book").modal("show")
            })
        }
    })


});
