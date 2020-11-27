// Fix scanner.component.ts
// https://stackoverflow.com/questions/13641692/how-to-use-getusermedia-from-typescript
interface Navigator {
    getUserMedia(
        options: { video?: boolean; audio?: boolean; }, 
        success: (stream: any) => void, 
        error?: (error: string) => void
        ) : void;
}

navigator.getUserMedia(
    {video: true, audio: true}, 
    function (stream) {  },
    function (error) {  }
);