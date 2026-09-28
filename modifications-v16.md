# Pa a Pa : modifications de la version 16

Ajout par rapport à la v15 (qui reste valable) : deux clics qui atterrissaient mal.

## « Effacer mes données »
Après l'effacement, la page se rechargeait et le navigateur la rouvrait à la même hauteur que le bouton, tout en bas. La page étant devenue plus courte, on arrivait au milieu du questionnaire. Maintenant, la page se rouvre en haut.

## « Recommencer » (questionnaire)
Après avoir recommencé, la page restait à la hauteur des anciens boutons, alors que le questionnaire était redevenu court. On est maintenant ramené au début du questionnaire.

## Ce qui a été vérifié dans un vrai Chrome (téléphone et ordinateur)
Depuis le milieu d'un onglet, un clic sur « Me lancer », « Durer » ou « Mes calculs » laissait l'écran à la même hauteur : le haut du nouvel onglet se trouvait à environ 1 300 pixels au-dessus de l'écran (mesure sur l'ancienne version). Dans la nouvelle version, le haut de l'onglet arrive juste sous la barre du haut. Idem pour les six outils. « Effacer mes données » ramenait en bas de page (hauteur 5 473 sur téléphone) et ramène maintenant en haut. Aucun débordement horizontal de la page. La grille des six outils et les boutons « précédent / suivant » ont été contrôlés sur captures.

## À faire de ton côté
Tes captures montrent encore l'ancienne version (question sur l'entourage, « Quatre chiffres à saisir »). Les fichiers de la v14 à v16 ne sont donc pas encore publiés sur GitHub : tant que ce n'est pas fait, ces défauts resteront visibles en ligne.
