import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CameraService } from 'src/app/services/camera/camera.service';
import { DatabaseService } from 'src/app/services/database/database.service';
import { FireStorageService } from 'src/app/services/fireStorage/fire-storage.service';
import { LobbyService } from 'src/app/services/lobby/lobby.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.page.html',
  styleUrls: ['./account-settings.page.scss'],
})
export class AccountSettingsPage implements OnInit {

  name: string;
  imageLink: string;

  constructor(
    private userService: UserService,
    private cameraService: CameraService,
    private databaseService: DatabaseService,
    private fireStorageService: FireStorageService,
    private changeDetector: ChangeDetectorRef,
    private router: Router,
    private lobbyService: LobbyService,
  ) { }

  ngOnInit() {
    this.userService.user.subscribe(user => {
      console.log(user);
      this.name = user?.username || "";
      this.imageLink = user?.userImageLink || "";
      console.log("acc setting user update");
      this.changeDetector.detectChanges();
    })
    
  }


  async changePicture(){
    let img = await this.cameraService.takePhoto();
    try{
      await this.fireStorageService.deleteImage(this.userService.user.value.userUUID);
    }
    catch(e){
      console.log(e);
    }
    let newLink = await this.fireStorageService.uploadImage(this.userService.user.value.userUUID, img);
    await this.databaseService.changeProfilePictureLink(this.userService.user.value, newLink);

  }

  async deleteAccount(){
    await this.lobbyService.leaveLobby();
    await this.databaseService.deleteUser(this.userService.user.value);
    await this.fireStorageService.deleteImage(this.userService.user.value.userImageLink);
    await this.userService.logout();
  }

}