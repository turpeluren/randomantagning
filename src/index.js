import coursedata_19 from './antagningar19.json' assert { type: 'json' };
import coursedata_20 from './antagningar20.json' assert { type: 'json' };
import coursedata_21 from './antagningar21.json' assert { type: 'json' };
import coursedata_22 from './antagningar22.json' assert { type: 'json' };

(function () {
    'use strict';

    /*
    var coursedata_19 = {}
    fetch('https://randomantagning.se/public/antagningar19.json').then(response => coursedata_19 = response.json())
    var coursedata_20 = {}
    fetch('https://randomantagning.se/public/antagningar20.json').then(response => coursedata_20 = response.json())
    var coursedata_21 = {}
    fetch('https://randomantagning.se/public/antagningar21.json').then(response => coursedata_21 = response.json())
    var coursedata_22 = {}
    fetch('https://randomantagning.se/public/antagningar22.json').then(response => coursedata_22 = response.json())*/

    const coursedata = [coursedata_19, coursedata_20, coursedata_21, coursedata_22];

    var expand = document.getElementById('expand');
    var heart = document.getElementById('heart');
    var addbtn = document.getElementById('add');

    const semesterDropdown = document.getElementsByClassName('semester')[0];
    const startSemester = 19; //Current semester, 19 = VT24
    var semesterValue = parseInt(semesterDropdown.value) + startSemester;

    const resultsection = document.getElementsByClassName('resultsection')[0];
    const resultcard = document.getElementById('resultcard');
    const randomize = document.getElementById('randomize');
    const visarResultatText = document.getElementById('visarResultatText');
    const nrshowing = document.getElementById('nrshowing');
    const nrofcoursesElem = document.getElementById('nrofcourses');
    const semesternameElem = document.getElementById('semestername');
    const latestcard = document.getElementById('latestCard');
    const undoBtn = document.getElementById('undoBtn');

    var title = document.getElementById('title');
    var hp = document.getElementById('hp');
    //greendot
    var dot = document.getElementById('dot');
    var period = document.getElementById('period');
    var info = document.getElementById('info');

    var alreadyfavourited = false;

    expand.addEventListener('click', function(){showmoreinfo(expand)});
    heart.addEventListener('click', function(){heartit(heart)});
    addbtn.addEventListener('click', addcourse);
    randomize.addEventListener('click', randomizecourse);
    undoBtn.addEventListener('click', undoCard);
    semesterDropdown.addEventListener('click', changesemester); //uppdatera semesterValue för vilken termin som e vald
    updateSemesterText(); //initialisera texten "Visar 1 av xxx utbildningar under xxx"

    function changesemester() {
        semesterValue = parseInt(semesterDropdown.value) + startSemester;
    }

    function randomizecourse() {
        //pick a random course from the array

        //save as latest course for undo option
        if (title.innerHTML != "Testnamn på en kurs") {
            latestcard.innerHTML = resultcard.innerHTML;
            undoBtn.classList.remove('hidden');
        }

        //show card at first press
        resultsection.classList.remove('hidden');
        visarResultatText.classList.remove('hidden');
        //set correct size of button-background
        expand.children[0].style.width = String(expand.offsetWidth) + 'px';
        expand.children[0].style.height = String(expand.offsetHeight-2) + 'px';

        // Random index
        var semesterCurrent = semesterValue - startSemester;
        var randindex = Math.round(Math.random()*coursedata[semesterCurrent].courses);

        // Load course
        title.innerHTML = coursedata[semesterCurrent][randindex].title;
        hp.innerHTML = coursedata[semesterCurrent][randindex].hp;
        dot.className = coursedata[semesterCurrent][randindex].dot;
        period.innerHTML = coursedata[semesterCurrent][randindex].period;
        info.innerHTML = coursedata[semesterCurrent][randindex].info;

        //unheart
        heart.classList.remove('active');
        alreadyfavourited = false;

        //visar 1 av xxx utbildningar under xxx
        updateSemesterText();
    }

    function updateSemesterText() {
        nrofcoursesElem.innerText = 'av ' + String(coursedata[semesterValue - startSemester].courses);
        semesternameElem.innerText = ' utbildningar under ' + String(semesterDropdown.children[semesterValue - startSemester].innerHTML);
    }

    function addcourse() {
        window.open(getcourse());
    }

    function opencourseUrl(url) {
        window.open(url);
    }

    function getcourse() {
        var infolist = document.getElementsByClassName('gridrowgap')[0];
        for(var i=0; i<infolist.children.length; i++) {
            if (infolist.children[i].children[0].innerHTML.includes('Anmälningskod')) {
                var s = infolist.children[i].outerHTML;
                s = s.split(">");
                s = s[3].split("\\")
                s = s[0].split("<")
                s = s[0].replace(/^\s+|\s+$/gm,'');
                return('https://www.antagning.se/se/search?period='+semesterValue+'&freeText='+s)
            }
        }
    }

    function undoCard() {
        //switch latest and current card to undo one step
        var buffercard = resultcard.innerHTML;
        resultcard.innerHTML = latestcard.innerHTML;
        latestcard.innerHTML = buffercard;

        //update which elements are the relevant ones
        title = document.getElementsByClassName('headline4')[0];
        hp = document.getElementsByClassName('hp')[0];
        period = document.getElementsByClassName('period')[0];
        info = document.getElementsByClassName('info')[0];

        expand = document.getElementsByClassName('showmoreinfo')[0];
        heart = document.getElementById('heart');
        addbtn = document.getElementById('add');

        expand.addEventListener('click', function(){showmoreinfo(expand)});
        heart.addEventListener('click', function(){heartit(heart)});
        addbtn.addEventListener('click', addcourse);
    }

    function heartit(instance) {
        //save a card with the heart button
        // pass the heart instance that's being pressed
        instance.classList.toggle('active');
        if (instance.classList.contains('active') && instance == heart && alreadyfavourited == false) {
            //clone the top(initial) card
            var favourite = resultcard.cloneNode(true);
            resultsection.appendChild(favourite);
            alreadyfavourited = true; //to not favourite same again

            //update the "showing x of this many courses"
            nrshowing.innerHTML = String(resultsection.children.length-1);
            
            //pass instance of heart to its eventlistener
            var heartslist = document.getElementsByClassName('favourite-toggle');
            const thisinstance = heartslist[heartslist.length-1];
            thisinstance.addEventListener('click', function(){heartit(thisinstance)})
            
            //pass instance of expand button to its eventlistener
            var infobtnslist = document.getElementsByClassName('showmoreinfo');
            const thisinfobtn = infobtnslist[infobtnslist.length-1];
            thisinfobtn.addEventListener('click', function(){showmoreinfo(thisinfobtn)})
            if(!thisinfobtn.nextElementSibling.classList.contains('hidden')) {
                //dont show more info if that is activated at duplication
                showmoreinfo(thisinfobtn);
            }
            
            //pass url to new addbtn's eventlistener
            var addbtnslist = document.getElementsByClassName('toggleselection');
            const thisaddbtn = addbtnslist[addbtnslist.length-1];
            const thisaddbtnUrl = getcourse();
            thisaddbtn.addEventListener('click', function(){opencourseUrl(thisaddbtnUrl)})
            
        } else {
            //remove unhearted cards (not top)
            if (instance != heart) {
                resultsection.removeChild(instance.parentElement.parentElement.parentElement.parentElement);
                alreadyfavourited = false;
                
                //update the "showing x of this many courses"
                nrshowing.innerHTML = String(resultsection.children.length-1);
                
            }
        }
    }

    function showmoreinfo(btninstance) {
        //expand button "Visa mer"
        // pass button and use nextelementsibling to get info
        var infoinstance = btninstance.nextElementSibling;
        infoinstance.classList.toggle('hidden');
        btninstance.classList.toggle('expanded');
        var buffer = btninstance.children[0];
        if (infoinstance.classList.contains('hidden')) {
            btninstance.innerHTML = 'Visa mer';
        } else {
            btninstance.innerHTML = 'Visa mindre';
        }
        //ste height of background
        buffer.style.width = String(btninstance.offsetWidth - 2) + 'px';
        buffer.style.height = String(btninstance.offsetHeight -2 ) + 'px';
        btninstance.appendChild(buffer);
    }

})();