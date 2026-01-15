use polymarket_client_sdk::clob::Client;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = Client::default();

    let ok = client.ok().await?;
    println!("Ok: {ok}");

    Ok(())
}
