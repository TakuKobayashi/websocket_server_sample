using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using WebSocketSharp;

public class WebsocketManager : MonoBehaviour
{
    [SerializeField] private string url;
    private WebSocket ws = null;
    private bool isSocketOpened = false;
    private List<string> receiveMessageQueue = new List<string>();
    private List<byte[]> receiveDataQueue = new List<byte[]>();
    public Action<string> OnReceiveMessage = null;
    public Action<byte[]> OnReceiveData = null;

    private void Start()
    {
        Connect(url);
    }

    void Update()
    {
        if (receiveMessageQueue.Count > 0)
        {
            for (int i = 0; i < receiveMessageQueue.Count; ++i)
            {
                if (OnReceiveMessage != null)
                {
                    OnReceiveMessage(receiveMessageQueue[i]);
                }
            }
            for (int i = 0; i < receiveDataQueue.Count; ++i)
            {
                if (OnReceiveData != null)
                {
                    OnReceiveData(receiveDataQueue[i]);
                }
            }
            receiveMessageQueue.Clear();
            receiveDataQueue.Clear();
        }
    }

    public void Connect(string wsUrl)
    {
        Debug.Log(wsUrl);
        // WebSocketのechoサーバ.
        this.ws = new WebSocket(wsUrl);

        // WebSocketをOpen.
        this.ws.OnOpen += (sender, e) => {
            isSocketOpened = true;
            Debug.Log("[WS] Open");
        };

        // メッセージを受信.
        this.ws.OnMessage += (sender, e) => {
            receiveMessageQueue.Add(e.Data);
            Debug.Log("[WS]Receive message: " + e.Data);
        };

        // WebSoketにErrorが発生.
        this.ws.OnError += (sender, e) => {
            Debug.Log("[WS]Error: " + e.Message.ToString());
        };

        // WebSocketがClose.
        this.ws.OnClose += (sender, e) => {
            Debug.Log("[WS]Close");
        };

        // WebSocketに接続.
        this.ws.Connect();
    }

    public void Send(string message)
    {
        StartCoroutine(SendCoroutine(message));
    }

    private IEnumerator SendCoroutine(string message)
    {
        while (!isSocketOpened)
        {
            yield return null;
        }
        this.ws.Send(message);
    }

    public void Close()
    {
        if (this.ws != null)
        {
            this.ws.Close();
        }
    }

    void OnDestroy()
    {
        Close();
    }
}
