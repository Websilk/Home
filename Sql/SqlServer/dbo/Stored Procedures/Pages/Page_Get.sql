

-- =============================================
-- Author:		Mark Entingh
-- Create date: 2/22/2012 11:11 AM
-- Description:	
-- =============================================
CREATE PROCEDURE [dbo].[Page_Get] 
	@websiteId int = 0,
	@pageId int = 0
AS
BEGIN
	SET NOCOUNT ON;

    SELECT * FROM View_PageInfo WHERE pageId=@pageId AND websiteId=@websiteId
END