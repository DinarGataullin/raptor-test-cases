eBay  Site Inventory and Audit (eSia) Application
====
<b>Wiki:</b> https://wiki.vip.corp.ebay.com/display/ProductSecurity/eSia

<b>URL:</b>  http://go/esia

<b>Installation Steps:</b>

1. Install Node

2. Install MongoDB

3. Run below commands to create necessary mongo database collections from commandline

  a. mongoimport --db esi_db --collection esi_co --file fingerprintResultsJSON.txt --jsonArray

  b. mongoimport --db esi_db --collection unixCmds --file unixCommands.txt --jsonArray

4. npm start
