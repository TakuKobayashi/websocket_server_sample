using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ChatUICanvas : MonoBehaviour
{
    [SerializeField] private WebsocketManager webSocketManager;
    [SerializeField] private InputField messageInput;
    [SerializeField] private GridLayoutGroup scrollGrid;
    [SerializeField] private GameObject messageTextObj;

    // Start is called before the first frame update
    void Start()
    {
        webSocketManager.OnReceiveMessage = OnReceiveMessage;
    }

    private void OnReceiveMessage(string message)
    {

    }

    public void OnSendMessage()
    {
        webSocketManager.Send(messageInput.text);
    }
}
