
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push, set, update, remove, onChildAdded, onChildRemoved, onChildChanged} 
from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import firebaseConfig from "./firebaseApikey.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig); //firebaseConfigを接続する
const db = getDatabase(app); //リアルタイムデータベースにアクセスする
const dbRef = ref(db,"book");

//******************************時間を整形する******************************
// クラスのインスタンス化
const currentDate = new Date();
const year = currentDate.getFullYear();
const month =String(currentDate.getMonth() + 1).padStart(2,"0") ;
const day = String(currentDate.getDate()).padStart(2,"0") ;
const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
const weekNumber = currentDate.getDay();
const currentweek = dayOfWeek[weekNumber];
const hour = currentDate.getHours();
const min = currentDate.getMinutes();
const imanohinichi = `${month}/${day}`;
const imanojikan = `${hour}:${min}`;


//******************************キープを押したら表示させる******************************
//最初にデータ取得&onsnapshotでリアルタイムにデータ取得
onChildAdded(dbRef,function(data){
    const book = data.val();
    const key = data.key;//ユニークKEY 削除更新に必須

    let view = '<div class="item keep_item" id="'+key+'" data-key="'+key+'">';
    view += '<div class="inner">';    
    view += '<p class="thumb"><img src="'+book.IMGURL+'" alt=""></p>';
    view += '<p class="bookname">'+book.NAME+'</p>';
    view += `<p class="save _on remove"><img src="img/btn_on.png"></p>`;
    view += '</div>';
    view += '</div>';

    $("#keep_content").append(view);

    $("#keep_content").hide();
    $("#keep").on("click",function(){
        const book = data.val();
        const key = data.key;//ユニークKEY 削除更新に必須
        console.log(book);
        console.log(key);
        $("#content").hide();
        $("#keep_content").show();
    });
});

//削除イベント
$("#keep_content").on("click",".remove",function(){
    const key = $(this).parent().parent().attr("data-key");
    const remove_item = ref(db,"book/"+key);
    console.log(key);
    remove(remove_item);
});


//******************************最初の一覧画面******************************
// var apiurl = "https://www.googleapis.com/books/v1/volumes?q="+word;   
var apiurl = "https://www.googleapis.com/books/v1/volumes?q="+"jquery";   
var view = "";

$.getJSON(
    apiurl,
    function(data) {
        console.dir(data);
        
        for(var i = 0; i<data.items.length; i++){
            var item = data.items[i];
            var bookname = item.volumeInfo.title;
            var thumbnail = item.volumeInfo.imageLinks.thumbnail;
            var description = item.volumeInfo.description;
            var authors = item.volumeInfo.authors;
        //    var wordcount = description.length;

        //    console.log(authors);

            
            if (item.volumeInfo.imageLinks.thumbnail) {
            view += '<div class="item">';
            view += '<div class="inner">';    
            view += '<p class="thumb"><img src="'+thumbnail+'" alt=""></p>';
            view += '<p class="bookname">'+bookname+'</p>';
            view += `<p class="save _off remove save_yellow"><img src="img/btn_on.png"></p>`;
            view += '</div>';
            view += '<div class="description">';
            view += `<p id="save_${i}" class="save _off"><img src="img/btn_off.png"></p>`;
            view += '<p class="text">'+description+'</p>';
            view += '</div>';
            view += '</div>';
            }

            $("#content").html(view);
        }
    }
);
//******************************さがすを押したら一覧を入れ替える******************************
$("#search").on("click",function(){
    var word = $("#input_text").val();
    console.log(word);
    $("#content").show();
    $("#keep_content").hide();

    //クリックしたら本の中身を変える
    var apiurl = "https://www.googleapis.com/books/v1/volumes?q="+word;   
    console.log(apiurl);
    var view = "";

    $.getJSON(
        apiurl,
        function(data) {
            console.dir(data);
            console.dir("レングスは" + data.items.length);
            for(var i = 0; i<data.items.length; i++){
                var item = data.items[i];
                var bookname = item.volumeInfo.title;
                var thumbnail = item.volumeInfo.imageLinks.thumbnail;
                var description = item.volumeInfo.description;
                
                var description = item.volumeInfo.description;

                if (item.volumeInfo.imageLinks.thumbnail) {
                    view += '<div class="item">';
                    view += '<div class="inner">';    
                    view += '<p class=""><img src="'+thumbnail+'" alt=""></p>';
                    view += '<p class="bookname">'+bookname+'</p>';
                    view += `<p class="save _off remove save_yellow"><img src="img/btn_on.png"></p>`;
                    view += '</div>';
                    view += '<div class="description">';
                    view += `<p id="save_${i}" class="save _off"><img src="img/btn_off.png"></p>`;
                    view += '<p class="text">'+description+'</p>';
                    view += '</div>';
                    view += '</div>';
                        }

                console.log(i+"回転目");
                $("#content").html(view);
            }
        }
    );

});

//******************************保存機能******************************
$(document).on('click', '.save', function(){ 
    const bookname = $(this).parent().prev().find(".bookname").html();
    const imageurl = $(this).parent().prev().find('img').attr('src');

    console.log("saveを押しました!");
    //saveを押した本をオブジェクト化
    const book = { 
            NAME : bookname,
            IMGURL : imageurl,
            day :imanohinichi,
            time : imanojikan
    }
    const newPostRef = push(dbRef);//ユニークキーを生成
    set(newPostRef,book);


    if($(this).hasClass('_on')){
        $(this).removeClass('_on').addClass('_off');
        console.log(this);
        //onのときの処理 機能してないっぽい
        $(this).parent().prev().find(".inner").prepend('<p class="savenow"><img src="img/btn_off.png"></p>');
        }
        if($(this).hasClass('_off')){
        $(this).removeClass("_off").addClass('_on');


        //offのときの処理 
        $(this).children("img").attr('src','img/btn_on.png');
        var koko = $(this).parent().prev(".inner").children(".save_yellow");
        console.log(koko);
        koko.show();
        }
});

//******************************削除機能******************************
    onChildRemoved(dbRef, (data) => {
        $("#"+data.key).remove();//DOM操作関数 (対象を削除)
    });

    $("#allremove").click(function (e) { 
        $(".keep_item").remove();
    });



//******************************descriptionのホバーアクション******************************
$(function(){

    $(document).on({
      'mouseenter' : function() { //ホバーしたときのアクション

    var description = $(this).children(".description");
        description.show();

    },
      'mouseleave' : function(){ //離れたときのアクション
        var description = $(this).children(".description");
        description.hide();
    }
      }, '.item');
  })



//   メモ
//アイコンを追加しておいてshouwとhideを切り替える