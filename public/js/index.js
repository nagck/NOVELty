window.globals = {
    gallery: ""
};

$(document).ready(function() {
    
    let sliderCurrent = $("#lightSlider-current").lightSlider(
        {
        item:3,
        slideMove:1,
        easing: 'cubic-bezier(0.25, 0, 0.25, 1)',
        speed:600,
        enableDrag:false,
        responsive : []
    }); 

    window.globals = {
        gallery: sliderCurrent
    };

    getRecommendation(recommendationISBN =>{
        
        console.log(recommendationISBN)
        for(let i = 0; i <recommendationISBN.length; i++){
            
            let img = $("<img>").attr("src",getBookCover(recommendationISBN[i]));
            img.attr("data-isbn",recommendationISBN[i]);
            let li = $("<li>");
            li.append(img);
            $("#lightSlider-recommendation").append(li)
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
                console.log($(e.target))
    
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

    $("#add-book").click(e =>{
        e.preventDefault();
        let bookObj = {
            isbn: $("#modal-new-book").attr("data-isbn"),
            title: $("#book-title").text(),
            author: $("#book-title").text()
        }

        addBookToList(bookObj,true, (notExists, data)=>{

            if(notExists[1]){

               
                $("#lightSlider-current").append($(`li img[data-isbn='${$("#modal-new-book").attr("data-isbn")}'`))
                globals.gallery.refresh();
                
            }
            
            $("#modal-new-book").modal("hide")
        })

    });


    $("#lightSlider-current").click(e =>{
        e.preventDefault();
        e.stopPropagation();
        
        if(e.target.matches("img")){
            $("#modal-rating").attr("data-isbn", $(e.target).attr("data-isbn"))
            $("#modal-rating").modal("show")   
        }
    })

    
    $("#rating-form").submit((e)=>{
        e.preventDefault();
        e.stopPropagation();
        let finished = $("input[type='radio'][name='flexRadioDefault']:checked").val();
        let rating = parseInt($("input[type='radio'][name='rating']:checked").val());
        let content = $("textarea").val();

        fetch(`/api/book/${$("#modal-rating").attr("data-isbn")}`)
            .then(response => response.json())
            .then(data => {
                let bookId = data[0].id;
                
                if(finished=== "true") {
                    let favourite = (rating < 3) ? false: true;
                    let updateObj = {
                        favourite : favourite,
                        bookId: bookId
                    }
    
                    fetch(`/api/books/`, {
                        method : "PUT",
                        headers: {
                            "content-type": "application/json",
                            "accept" : "application/json"
                        },
                        body: JSON.stringify(updateObj)
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        $("#past-list").append($(`img[data-isbn='${$("#modal-rating").attr("data-isbn")}'`))
                        $("#modal-rating").attr("data-isbn", "");
                        $("#finished").prop('checked', true);        
                        $('input[name=rating]').attr('checked',false);                
                        $("textarea").val("");
                        $("#modal-rating").modal("hide") 
                    })
                }
                else{
                    fetch(`/api/book/${bookId}`, {
                        method : "DELETE"
                    })
                    .then(response => response.json())
                    .then(data =>{
                        console.log(data);
                        $(`img[data-isbn='${$("#modal-rating").attr("data-isbn")}'`).remove();
                        $("#modal-rating").attr("data-isbn", "");
                        $("#finished").prop('checked', true);        
                        $('input[name=rating]').attr('checked',false);                
                        $("textarea").val("");
                        $("#modal-rating").modal("hide") 
                    })
                }

                let reviewObj = {
                    content: content,
                    rating: rating
                }
                fetch(`/api/books/review/${bookId}`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "accept" : "application/json"
                    },
                    body: JSON.stringify(reviewObj)
                })
                .then(response => response.json())
                .then(data => console.log(data))
                
            })
    });

});
