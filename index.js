var express = require('express');
var request = require('request');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

/* ===== App Variables ===== */
var slackUrl = process.env.SLACK_WEBHOOK_URL;
var slackBotName = process.env.SLACK_BOT_NAME;
var slackChannel = process.env.SLACK_CHANNEL;
var normalName = process.env.LUNCH_NORMAL_NAME;
var specialName = process.env.LUNCH_SPECIAL_NAME;
var specialLocation = process.env.LUNCH_SPECIAL_LOCATION;
var specialTime = process.env.LUNCH_SPECIAL_TIME;
var ctaText = process.env.LUNCH_CTA;
var paused = process.env.PAUSED;
var bot_text;
var time = '';
var isSpecial = false;

// List of restaurants and Google Maps urls as JSON	
var lunchSpots = [
  {
    "restaurant": "Sin Teck Huat Coffee Shop (Chicken Rice/Fish Soup)",
    "address": "73 Lorong 4 Toa Payoh, Singapore 310073",
    "location": "https://www.google.com.sg/maps/place/Sin+Teck+Huat/@1.3340652,103.8516739,18z/data=!4m5!1m2!2m1!1sSin+Teck+Huat+Coffee+Shop!3m1!1s0x0000000000000000:0x9c78e2a715305a89"
  },
  {
    "restaurant": "Gourmet Paradise Food Court (HDB Hub Basement)",
    "address": "Toa Payoh HDB Hub, Blk 480 Lorong 6 Toa Payoh #B1-01, Singapore 310480",
    "location": "https://www.google.com.sg/maps/place/480+Lor+6+Toa+Payoh,+Singapore+310480/@1.3321385,103.8485877,17z/data=!4m2!3m1!1s0x31da1766c2e7005f:0xdd8c769578eb95b8"
  },
  {
    "restaurant": "Koufu Food Court (HDB Mall 2nd Floor next to Popular)",
    "address": "Toa Payoh HDB Mall, 500 Lor 6 Toa Payoh, Singapore 310500",
    "location": "https://www.google.com.sg/maps/place/Toa+Payoh+HDB+Mall/@1.332946,103.8471096,19z/data=!4m7!1m4!3m3!1s0x31da176705462ff1:0x7dadddc8404c78cb!2s500+Lor+6+Toa+Payoh,+Singapore+310500!3b1!3m1!1s0x0000000000000000:0xf318050035fe38e7"
  },
  {
    "restaurant": "Subway (HDB Hub)",
    "address": "480 Lorong 6 Toa Payoh, #01-13, S310480",
    "location": "https://www.google.com.sg/maps/place/Subway/@1.332373,103.848437,17z/data=!3m1!4b1!4m2!3m1!1s0x31da1766c2aaaaab:0xa7ff08d05fccbf62"
  },
  {
    "restaurant": "Astons Specialties (SAFRA)",
    "address": "293 Toa Payoh Lorong 6, Singapore 319387",
    "location": "https://www.google.com.sg/maps/place/Safra+Toa+Payoh/@1.329911,103.854256,17z/data=!3m1!4b1!4m2!3m1!1s0x31da17636bdfc367:0x265674622268edec"
  },
  {
    "restaurant": "MacDonalds (SAFRA)",
    "address": "293 Toa Payoh Lorong 6, Singapore 319387",
    "location": "https://www.google.com.sg/maps/place/Safra+Toa+Payoh/@1.329911,103.854256,17z/data=!3m1!4b1!4m2!3m1!1s0x31da17636bdfc367:0x265674622268edec"
  },
  {
    "restaurant": "Toast Box (SAFRA)",
    "address": "293 Toa Payoh Lorong 6, Singapore 319387",
    "location": "https://www.google.com.sg/maps/place/Safra+Toa+Payoh/@1.329911,103.854256,17z/data=!3m1!4b1!4m2!3m1!1s0x31da17636bdfc367:0x265674622268edec"
  },
  {
    "restaurant": "Block 75 Hawker Centre",
    "address": "75 Lorong 5 Toa Payoh, Singapore 310075",
    "location": "https://www.google.com.sg/maps/place/Lorong+5+Toa+Payoh+Block+75+Food+Centre/@1.336118,103.852988,17z/data=!3m1!4b1!4m2!3m1!1s0x31da176f7c8ba915:0x79563c156145fe51"
  },
  {
    "restaurant": "Super 28 Coffee Shop (near NTUC)",
    "address": "Block 184 Toa Payoh Central #01-372, Singapore 310184",
    "location": "https://www.google.com.sg/maps/place/Super+28+Coffee+Shop/@1.331862,103.850296,17z/data=!3m1!4b1!4m2!3m1!1s0x31da176696db042f:0xd0497ffdb4e684ab"
  },
  {
    "restaurant": "Mun Ting Xiang Tea Hut (Entertainment Centre)",
    "address": "450 Lorong 6 Toa Payoh #01-03/04, Toa Payoh Entertainment Centre, Singapore 319394",
    "location": "https://www.google.com.sg/maps/place/Toa+Payoh+Entertainment+Centre/@1.331456,103.849373,17z/data=!3m1!4b1!4m2!3m1!1s0x31da1766b7431539:0xe219c8c526b3ecf3"
  },
  {
    "restaurant": "Moon Sun Coffee Shop",
    "address": "177 Toa Payoh Central #01-176, Singapore 310177",
    "location": "https://www.google.com.sg/maps/place/Toa+Payoh+Lucky+Pisang+Raja+(Stall+at+Moon+Sun+Restaurant)/@1.333924,103.849789,17z/data=!3m1!4b1!4m2!3m1!1s0x0000000000000000:0x66639056e05c7b97"
  },
  {
    "restaurant": "Saizeriya",
    "address": "Blk 190 Toa Payoh Central #02-514, Singapore 319196",
    "location": "https://www.google.com.sg/maps/place/190A+Toa+Payoh+Central,+Singapore+319196/@1.3331434,103.8496145,17z/data=!3m1!4b1!4m2!3m1!1s0x31da17668e92dc85:0x47444ec31b7e1541"
  },
  {
    "restaurant": "Mos Burger",
    "address": "Toa Payoh HDB Hub, 490 Toa Payoh Lorong 6 #01-13, Singapore 310490",
    "location": "https://www.google.com.sg/maps/place/Mos+Burger/@1.33202,103.84952,15z/data=!4m5!1m2!2m1!1stoa+payoh+mos+burger!3m1!1s0x31da1766b958b3dd:0xe799c71b4dacfc0"
  },
  {
    "restaurant": "Burger King",
    "address": "Toa Payoh HDB Mall, 530 Lor 6 Toa Payoh, Singapore 310530",
    "location": "https://www.google.com.sg/maps/place/Burger+King+Toa+Payoh/@1.332493,103.847834,15z/data=!4m5!1m2!2m1!1sburger+king!3m1!1s0x31da1766b958b3dd:0x57c1ce751a177d29"
  },
  {
    "restaurant": "Ichiban Sushi",
    "address": "Toa Payoh HDB Hub, 490 Lor 6 Toa Payoh, Singapore 310490",
    "location": "https://www.google.com.sg/maps/place/Ichiban+Sushi/@1.332254,103.848375,15z/data=!4m2!3m1!1s0x0:0xa972592bcc86bb84?sa=X&ei=5IuHVYbOCcm1uASQ0oHQAQ&ved=0CBIQ_BIwAA"
  },
];

/* ===== HTTP REQUESTS ===== */
app.post('/lunchbot', function(req, res) {
  
  // If paused state, do nothing
  if(typeof paused != 'undefined' &&
      (paused.toLowerCase() == 'true' || paused.toLowerCase() == 'yes')) {
    res.send('App is paused.');
    return;
  }
  
  // Check if special location is set
  if(typeof specialName != 'undefined' && specialName != '' &&
     typeof specialLocation != 'undefined' && specialLocation != '') {
    
    isSpecial = true;
    
    if (typeof specialTime != 'undefined' && specialTime != '') {
      time = ' at ' + specialTime + ',';
    }
  }
  
  // If special location is set
  if(isSpecial) {
    bot_text = "Today, we have a very special lunch scheduled"+time+" at *"+specialName+"*. It's <"+specialLocation+"|here>.";
  }
  else {
    
    var pick = -1;
    
    // If normal name is set, look for it
    //console.log(normalName);
    if(typeof normalName != 'undefined' && normalName != '') {
      normalName = normalName.toLowerCase();
      for(var i=0; i<lunchSpots.length; i++) {
        if(lunchSpots[i].restaurant.toLowerCase().indexOf(normalName) >= 0) {
          pick = i;
          break;
        }
      }
    }
    
    // If pick is not set yet, do random pick
    if(pick == -1) {
      // Pick a number, 0 to the length of the restaurant list less one
      pick = Math.floor( Math.random() * (lunchSpots.length - 1 ) );
    }
    //console.log(pick);

    bot_text = "Today, may I suggest *" + lunchSpots[pick].restaurant + "*. It's <" + lunchSpots[pick].location + "|here>.";

    if (lunchSpots[pick].details){
      bot_text = bot_text + " " + lunchSpots[pick].details;
    }
  }

  //console.log(bot_text);
  
  // Compose the message and other details to send to Slack 
  var payload = {
    text: bot_text,
    icon_emoji: ":fork_and_knife:",
    username: slackBotName,
    channel: slackChannel
  };

  // Set up the sending options for the request function.
  // See note about the SLACK_WEBHOOK_URL above.
  var options = {
    url: slackUrl,
    method: 'POST',
    body: payload,
    json: true,
    unfurl_links: true,
    parse: 'full'
  };

  // Send the webhook
  request(options, function (error, response, body){
    if (!error && response.statusCode == 200) {
      console.log(body);
    } else {
      console.log(error);
    }
  });
  
  res.send('Success.');
});

app.get('/lunchbot', function(req, res) {
  
  console.log(req);
  
  // Validation
  if(typeof req.query === 'undefined' || 
      typeof req.query.text === 'undefined' || 
      req.query.text == '') {
    console.log('Parameter not found.');
    res.send('Parameter not found.');
    return;
  }
  
  var message = decodeURIComponent((req.query.text).replace(/\+/g, '%20'));
  console.log('Message: ' + message);
  
  // Compose the message and other details to send to Slack 
  var payload = {
    text: message,
    icon_emoji: ":fork_and_knife:",
    username: slackBotName,
    channel: slackChannel
  };

  // Set up the sending options for the request function.
  // See note about the SLACK_WEBHOOK_URL above.
  var options = {
    url: slackUrl,
    method: 'POST',
    body: payload,
    json: true
  };
  
  // Send the webhook
  request(options, function (error, response, body){
    if (!error && response.statusCode == 200) {
      console.log(body);
    } else {
      console.log(error);
    }
  });
  
  res.send('Success.');
});

/* ===== Start App ===== */
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});