# youtube-telegram_bot(node.js)
### Obshee opisanie bota
бот оповещает об изменении (удаление или загрузка) контента youtube канала
### detalnoe opisanie bota
pri izmenenii(udalenie ili zagruzka) opredelennogo youtube kanala bot:
* opoveshaet idinstvennogo polzovatelya telegram (pozje v planah sdelat chtob on opoveshal vsyu gruppu,v kotoryy bot budet dobavlen)
* zaprosy na izmenenie youtube kanala idut sploshnym potokom bez setInterval (hotya bot mojet uchityvat kollichestvo zaprosov ishodya ot kwot youtube i telegram)
* bot proveryaet 3 poslednih vide youtube kanala (po defoltu youtube-data-api maximalnoe kollichestvo video vozmojno 50,no est vozmojnost uvelichit kollichestvo ispolzovav NextPageToken,kotoryy prihodit v response)
