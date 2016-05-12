## Uploading Changes

The production folder is on a Raspberry Pi 1 : /home/pi/repo/Wayfinder

1. When changes have been made a zip file of the Wayfinder folder in C: drive must be created.
2. Call it Wayfinder.zip and store it in Desktop so the path should be C://Desktop/Wayfinder.zip
3. Open Git Bash and change into working directory (Where the Wayfinder project lives)
4. Run sh UpdateScript/update.sh from the Git Bash command line

NOTE: You will be asked for the Wayfinder password twice. Password is Community07.
      TO avoid this you will need to generate ssh keys from your local machine and upload public key to Wayfinder.
      Help on this topic : https://confluence.atlassian.com/bitbucketserver/creating-ssh-keys-776639788.html

The Wayfinder should now be rebooting with updated changes.

HELP: When the file has been uploaded you may be prompt to update .git hidden folder. Pressing 'A' then enter will overwrite this folder.

## Copyright and License

Copyright 2013-2015 CommunityCentral, LLC. Code released under the [Apache 2.0](https://bitbucket.org/communitycentral/wayfinder/overview) license.
