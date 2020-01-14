import { Alert } from "react-native"
import MarkerModel from '../Models/MarkerModel'
import EmailModel from '../Models/EmailModel'

export default class ChainOfResponsibility {
    setNext(next) {
        if(this.next === undefined) {
            this.next = next
        } else {
            this.next.setNext(next)
        }
    }
}

export class CheckEmail extends ChainOfResponsibility {
    handle(data) {
        if(data.mapState.markers.length === 0) {
            Alert.alert('Нету маркеров', 'Вы не постаили ни один маркер на карту')
        } else {
            this.next.handle(data)
        }
    }
}

export class CheckMarkers extends ChainOfResponsibility {
    handle(data) {
        if(data.settingsState.email.EmailAddress === undefined) {
            Alert.alert('Не указана почта', 'Пожалуйста зайдите в настройки и укажите корректную почту')
        } else {
            this.next.handle(data)
        }
    }
}

export class SendEmail {
    handle(data) {
        navigator.geolocation.getCurrentPosition(pos => {
            console.log('trye')
            var flag = true
            var myPosition = new MarkerModel(pos.coords.latitude, pos.coords.longitude)
            data.mapState.markers.map(marker => {
                flag = flag && (myPosition.Distance(marker) <= parseFloat(data.settingsState.radius))
            })
            if(!flag) return
            var res = data.mapState.markers.map((marker, index) => {
                return `${index}) lat: ${marker.Latitude} long: ${marker.Longitude}`
            })
            var email = new EmailModel(data.settingsState.email.EmailAddress)
            
            email.Subject = 'GPS coordinates'
            email.Body = `myPosition: lat: ${myPosition.Latitude} long: ${myPosition.Longitude}, ${res.join('\n')}`
            email.openMail()
        })
    }
}