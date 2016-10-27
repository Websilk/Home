-- =============================================
-- Author:		Mark Entingh
-- Create date: 5/13/2009 5:39 PM
-- Description:	Generates a new Page Layer for a website
-- =============================================
CREATE PROCEDURE [dbo].[AddWebsiteLayer] 
	@websiteId int = 0,
	@title nvarchar(100) = ''
AS
BEGIN
	SET NOCOUNT ON;
    DECLARE @templateId int,
    @homeId int,
    @themeownerid int,
    @myDate datetime = GETDATE()
    SET @templateId = CAST(RAND() * 1000 AS INT)
    INSERT INTO PageLayers (layerId, websiteId, title, datecreated)
    VALUES(@templateId, @websiteId, @title, @myDate)
END
