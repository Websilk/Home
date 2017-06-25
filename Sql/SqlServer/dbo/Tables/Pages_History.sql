CREATE TABLE [dbo].[Pages_History]
(
	[pageId] INT NOT NULL DEFAULT 0, 
    [websiteId] INT NOT NULL DEFAULT 0, 
    [userId] INT NOT NULL DEFAULT 0 , 
    [datemodified] DATETIME NOT NULL DEFAULT GETDATE()
)
